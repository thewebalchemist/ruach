import type { NextApiRequest, NextApiResponse } from 'next';
import { getKnowledgeBase, buildSystemPrompt } from '@/lib/knowledge';
import { retrieveSermons, buildRetrievedSermonsBlock, findRelevantSermonsFromChunks } from '@/lib/sermon-rag';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Groq } from 'groq-sdk';

const ANONYMOUS_SESSION_LIMIT = 10;
const ANONYMOUS_HOURLY_LIMIT  = 20;
const SIGNED_IN_LIMIT         = 1000;

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; created_at: string; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, session_id, conversation_history = [], user_id } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const clientIp        = getClientIp(req);
  const browserSessionId = session_id || generateSessionId();

  if (!user_id) {
    const rateLimit = await checkRateLimit(clientIp, browserSessionId);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: rateLimit.message,
        rate_limit: { remaining: 0, reset_at: rateLimit.reset_at },
        suggest_signin: true,
      });
    }
  }

  // Run the base knowledge (cached) and the vector retrieval in parallel for speed.
  const [knowledge, chunks] = await Promise.all([
    getKnowledgeBase(),
    retrieveSermons(message),
  ]);
  // RAG: replace the old "stuff every sermon summary into the prompt" (CAG)
  // approach with only the retrieved passages that actually match the question.
  knowledge.sermons = [];
  const systemPrompt = buildSystemPrompt(knowledge) + buildRetrievedSermonsBlock(chunks);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversation_history.slice(-8).map((msg: ChatMessage) => ({ role: msg.role as 'user' | 'assistant', content: msg.content })),
    { role: 'user' as const, content: message },
  ];

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const stream = await groq.chat.completions.create({
      messages,
      model:       'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_completion_tokens: 900,
      top_p:       0.9,
      stream:      true,
    });

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullContent += delta;
        // Strip think tags on the fly
        const cleaned = delta.replace(/<think>[\s\S]*?<\/think>/gi, '');
        if (cleaned) {
          res.write(`data: ${JSON.stringify({ type: 'delta', content: cleaned })}\n\n`);
        }
      }
    }

    // Clean final content
    fullContent = fullContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Sermon cards from the retrieved passages (RAG)
    const relevantSermons = await findRelevantSermonsFromChunks(chunks);

    // Update rate limit
    if (!user_id) await incrementRateLimit(clientIp, browserSessionId);

    const remaining = user_id
      ? SIGNED_IN_LIMIT
      : await getRemainingLimit(clientIp, browserSessionId);

    // Send final metadata event
    res.write(`data: ${JSON.stringify({
      type:    'done',
      session_id: browserSessionId,
      rate_limit: { remaining, reset_at: getNextHourTimestamp() },
      relevant_sermons: relevantSermons,
    })}\n\n`);

    res.end();
  } catch (error) {
    console.error('Chat API error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Something went wrong. Please try again.' })}\n\n`);
    res.end();
  }
}

function findRelevantSermons(
  userMessage: string,
  aiResponse:  string,
  sermons:     any[]
): any[] {
  if (!sermons.length) return [];

  // Extract slugs mentioned in the AI response (format: /some-slug)
  const slugPattern = /\/([a-z0-9]+(?:-[a-z0-9]+)+)/g;
  const mentionedSlugs = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = slugPattern.exec(aiResponse)) !== null) {
    mentionedSlugs.add(m[1]);
  }

  // Find sermons whose slug was mentioned
  const mentioned = sermons.filter(s => mentionedSlugs.has(s.slug));
  if (mentioned.length >= 2) {
    return mentioned.slice(0, 3).map(s => ({
      id: s.id, title: s.title, preacher: s.preacher,
      slug: s.slug, youtube_url: (s as any).youtube_url,
      service_date: s.service_date, scripture_ref: s.scripture_ref,
    }));
  }

  // Keyword fallback — search user message against sermon titles/notes
  const query = userMessage.toLowerCase();
  const words = query.split(/\s+/).filter(w => w.length > 3);

  const scored = sermons.map(s => {
    let score = 0;
    const text = `${s.title} ${s.description || ''} ${(s as any).notes || ''}`.toLowerCase();
    words.forEach(w => { if (text.includes(w)) score++; });
    if (s.title.toLowerCase().includes(query)) score += 5;
    return { s, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(({ s }) => ({
    id: s.id, title: s.title, preacher: s.preacher,
    slug: s.slug, youtube_url: (s as any).youtube_url,
    service_date: s.service_date, scripture_ref: s.scripture_ref,
  }));
}

function getClientIp(req: NextApiRequest): string {
  const f = req.headers['x-forwarded-for'];
  if (typeof f === 'string') return f.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

async function checkRateLimit(ip: string, sessionId: string): Promise<{ allowed: boolean; message?: string; reset_at?: string }> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: ipData } = await supabaseAdmin.from('chat_rate_limits').select('message_count').eq('ip_address', ip).gte('window_start', hourAgo);
  const totalIp = ipData?.reduce((s, r) => s + r.message_count, 0) || 0;
  if (totalIp >= ANONYMOUS_HOURLY_LIMIT) {
    return { allowed: false, message: "You've reached the hourly limit. Sign in for unlimited access!", reset_at: getNextHourTimestamp() };
  }
  const { data: sessionData } = await supabaseAdmin.from('chat_rate_limits').select('message_count').eq('ip_address', ip).eq('session_id', sessionId).single();
  if ((sessionData?.message_count || 0) >= ANONYMOUS_SESSION_LIMIT) {
    return { allowed: false, message: "You've reached the session limit. Sign in to continue chatting!", reset_at: getNextHourTimestamp() };
  }
  return { allowed: true };
}

async function incrementRateLimit(ip: string, sessionId: string): Promise<void> {
  const { data: existing } = await supabaseAdmin.from('chat_rate_limits').select('id, message_count').eq('ip_address', ip).eq('session_id', sessionId).single();
  if (existing) {
    await supabaseAdmin.from('chat_rate_limits').update({ message_count: existing.message_count + 1 }).eq('id', existing.id);
  } else {
    await supabaseAdmin.from('chat_rate_limits').insert({ ip_address: ip, session_id: sessionId, message_count: 1, window_start: new Date().toISOString() });
  }
}

async function getRemainingLimit(ip: string, sessionId: string): Promise<number> {
  const { data } = await supabaseAdmin.from('chat_rate_limits').select('message_count').eq('ip_address', ip).eq('session_id', sessionId).single();
  return Math.max(0, ANONYMOUS_SESSION_LIMIT - (data?.message_count || 0));
}

function getNextHourTimestamp(): string {
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  return now.toISOString();
}

export const config = { api: { bodyParser: { sizeLimit: '100kb' } } };
