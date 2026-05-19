import type { NextApiRequest, NextApiResponse } from 'next';
import { getKnowledgeBase, buildSystemPrompt } from '@/lib/knowledge';
import { supabase } from '@/lib/supabase';
import { ChatMessage, ChatResponse } from '@/types';
import { Groq } from 'groq-sdk';

// Rate limiting constants
const ANONYMOUS_SESSION_LIMIT = 10;
const ANONYMOUS_HOURLY_LIMIT = 20;
const SIGNED_IN_LIMIT = 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      session_id,
      conversation_history = [],
      user_id,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const clientIp = getClientIp(req);
    const browserSessionId = session_id || generateSessionId();

    // Check rate limits for anonymous users
    if (!user_id) {
      const rateLimit = await checkRateLimit(clientIp, browserSessionId);
      
      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: rateLimit.message,
          rate_limit: {
            remaining: 0,
            reset_at: rateLimit.reset_at,
          },
          suggest_signin: true,
        });
      }
    }

    const knowledge = await getKnowledgeBase();
    const systemPrompt = buildSystemPrompt(knowledge);

    // Build conversation messages for the API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.slice(-10).map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Groq API
    const groqResponse = await callGroqAPI(messages);

    if (!groqResponse.success) {
      return res.status(500).json({ 
        error: 'Failed to get response from AI',
        details: groqResponse.error,
      });
    }

    // Update rate limit counter for anonymous users
    if (!user_id) {
      await incrementRateLimit(clientIp, browserSessionId);
    }

    const remaining = user_id 
      ? SIGNED_IN_LIMIT 
      : await getRemainingLimit(clientIp, browserSessionId);

    const response: ChatResponse = {
      message: groqResponse.content ?? '',
      session_id: browserSessionId,
      rate_limit: {
        remaining,
        reset_at: getNextHourTimestamp(),
      },
    };

    if (conversation_history.length === 0) {
      response.suggested_questions = [
        "What time are Sunday services?",
        "How can I join a small group?",
        "Tell me about upcoming events",
        "How can I submit a prayer request?",
      ];
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.',
    });
  }
}

/**
 * Call Groq API with Qwen3 32B using SDK
 */
async function callGroqAPI(messages: any[]): Promise<{ success: boolean; content?: string; error?: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const groq = new Groq({ apiKey });
    
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.3-70b-versatile', // Use Llama 3.3 70B - better for chat, no thinking output
      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 0.9,
    });

    let content = chatCompletion.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'No content in response' };
    }

    // Strip out any <think> tags and their content (in case they appear)
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // If content is empty after stripping, return error
    if (!content) {
      return { success: false, error: 'No usable content in response' };
    }

    return { success: true, content };

  } catch (error) {
    console.error('Groq API call failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

async function checkRateLimit(
  ip: string, 
  sessionId: string
): Promise<{ allowed: boolean; message?: string; reset_at?: string }> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data: ipData } = await supabase
    .from('chat_rate_limits')
    .select('message_count')
    .eq('ip_address', ip)
    .gte('window_start', hourAgo);

  const totalIpMessages = ipData?.reduce((sum, row) => sum + row.message_count, 0) || 0;
  
  if (totalIpMessages >= ANONYMOUS_HOURLY_LIMIT) {
    return {
      allowed: false,
      message: 'You\'ve reached the hourly limit. Sign in for unlimited access!',
      reset_at: getNextHourTimestamp(),
    };
  }

  const { data: sessionData } = await supabase
    .from('chat_rate_limits')
    .select('message_count')
    .eq('ip_address', ip)
    .eq('session_id', sessionId)
    .single();

  const sessionMessages = sessionData?.message_count || 0;

  if (sessionMessages >= ANONYMOUS_SESSION_LIMIT) {
    return {
      allowed: false,
      message: 'You\'ve reached the session limit. Sign in to continue chatting!',
      reset_at: getNextHourTimestamp(),
    };
  }

  return { allowed: true };
}

async function incrementRateLimit(ip: string, sessionId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('chat_rate_limits')
    .select('id, message_count')
    .eq('ip_address', ip)
    .eq('session_id', sessionId)
    .single();

  if (existing) {
    await supabase
      .from('chat_rate_limits')
      .update({ message_count: existing.message_count + 1 })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('chat_rate_limits')
      .insert({
        ip_address: ip,
        session_id: sessionId,
        message_count: 1,
        window_start: new Date().toISOString(),
      });
  }
}

async function getRemainingLimit(ip: string, sessionId: string): Promise<number> {
  const { data } = await supabase
    .from('chat_rate_limits')
    .select('message_count')
    .eq('ip_address', ip)
    .eq('session_id', sessionId)
    .single();

  const used = data?.message_count || 0;
  return Math.max(0, ANONYMOUS_SESSION_LIMIT - used);
}

function getNextHourTimestamp(): string {
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  return now.toISOString();
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100kb',
    },
  },
};