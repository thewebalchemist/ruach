#!/usr/bin/env node
/**
 * One-time backfill: regenerate JK-style sermon articles + embed all sermons
 * into the pgvector store (sermon_chunks) so "Ask Ruach" answers via RAG.
 *
 * Prereqs: run supabase/rag_and_upgrades.sql first (adds sermons.article,
 * sermon_chunks, match_sermons).
 *
 * Run:
 *   node --env-file=.env.local scripts/backfill-rag.mjs            # articles + embeddings
 *   node --env-file=.env.local scripts/backfill-rag.mjs --embed-only
 *   node --env-file=.env.local scripts/backfill-rag.mjs --articles-only
 */
import { createClient } from '@supabase/supabase-js';
import { Mistral } from '@mistralai/mistralai';
import { Groq } from 'groq-sdk';

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MISTRAL_KEY = process.env.MISTRAL_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;
if (!SUPA || !SVC || !MISTRAL_KEY || !GROQ_KEY) {
  console.error('Missing env. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MISTRAL_API_KEY, GROQ_API_KEY');
  process.exit(1);
}

const args = process.argv.slice(2);
const EMBED_ONLY = args.includes('--embed-only');
const ARTICLES_ONLY = args.includes('--articles-only');
// By default skip sermons that already have a solid article (idempotent /
// gap-fill re-runs). Pass --force to regenerate every article from scratch.
const FORCE = args.includes('--force');
// Limit to specific slugs: --only=slug-a,slug-b (handy for spot-checks).
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '').split(',').map((x) => x.trim()).filter(Boolean);
// Article writer engine: --via=groq (default, exact JK model) or --via=mistral
// (mistral-large — same prompt/voice, no Groq daily cap).
const VIA = (args.find((a) => a.startsWith('--via=')) || '--via=groq').replace('--via=', '');
const MISTRAL_WRITER = 'mistral-large-latest';

const sb = createClient(SUPA, SVC, { auth: { persistSession: false } });
const mistral = new Mistral({ apiKey: MISTRAL_KEY });
const groq = new Groq({ apiKey: GROQ_KEY });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function chunkText(text, size = 1400, overlap = 200) {
  const clean = (text || '').replace(/\r\n/g, '\n').trim();
  if (!clean) return [];
  if (clean.length <= size) return [clean];
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const slice = clean.slice(start, end);
      const para = slice.lastIndexOf('\n\n');
      const sen = slice.lastIndexOf('. ');
      const cut = para > size * 0.5 ? para : sen > size * 0.5 ? sen + 1 : -1;
      if (cut > 0) end = start + cut;
    }
    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end === clean.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

// Voice/prompt kept IDENTICAL to lib/sermon-article.ts so bulk backfill and the
// control-panel "Generate" button produce the same first-person JK-style article.
const PREACHER_VOICE =
  'a Spirit-filled pastor who grounds every point in Scripture and spiritual formation, then connects it to everyday life — faith, family, work, purpose and community';

async function generateArticle(s) {
  const hasTranscript = (s.transcript || '').trim().length > 100;
  const hasNotes = (s.notes || '').trim().length > 100;
  if (!hasTranscript && !hasNotes) return null;
  const speaker = s.preacher || 'the preacher';

  let sourceBlock;
  if (hasTranscript) {
    sourceBlock = `Below is the transcript of what ${speaker} said. Use it for the ACTUAL TEACHING — his points, scriptures, stories and meaning. But this is NOT a transcription; do not copy it line by line.
--- TRANSCRIPT START ---
${s.transcript.trim().slice(0, 14000)}
--- TRANSCRIPT END ---`;
  } else {
    sourceBlock = `There is no transcript, only these existing notes/summary. Expand them faithfully into the full teaching below — do not invent specific quotes, stories, or statistics beyond what they imply.
--- NOTES START ---
${s.notes.trim().slice(0, 14000)}
--- NOTES END ---`;
  }

  const prompt = `Write a written article that explains the message "${s.title}"${s.scripture_ref ? `, anchored in ${s.scripture_ref}` : ''}, in the FIRST PERSON as ${speaker} himself (${PREACHER_VOICE}). Use "I", "we", and "you".

PURPOSE: This is for someone who will NOT watch the video. By the end of the article they should fully UNDERSTAND the message — the point, the scriptures, and what to do about it — as if they had heard it themselves. Understanding is the whole goal.

${sourceBlock}

TURN THE SPOKEN MESSAGE INTO CLEAN WRITING:
- Rewrite what he said into clear written prose. Never quote the transcript word-for-word.
- Cut everything that only works live: telling the audience to "find/tell your neighbour", "say amen", "give God a hand", song or worship cues, announcements, side-comments, and phrases he repeats over and over for effect. A reader must never hit a line like "I need you to find a neighbour and tell them…".
- Keep only the teaching. If a spoken sentence is half-finished or rambling, state its point in one clean sentence.

LANGUAGE:
- Easy, everyday English — short sentences, common words, the plain way he talks. Explain any church or theological word in simple terms.
- Warm, pastoral, honest, and courageous. Keep his tone and any strong picture he used, but written cleanly.

COVER THE WHOLE MESSAGE so the reader truly gets it:
- Open with a real hook drawn from the message itself. Never "In this powerful message…".
- Say the main point plainly, and why it matters for us now.
- Walk through the main things he taught (a short bulleted list is fine here), naming the scriptures he opened and what they mean.
- Show how those scriptures hold the message together — connect Old and New Testament if he did.
- Give 2–3 concrete, doable ways to live this out this week.
- Pull one real teaching line into a blockquote (>), in his own words — a full, meaningful sentence, never a crowd-instruction line.
- End with a warm, direct charge — something to do, pray, or decide.
- Close with a few honest questions to sit with, alone or in a small group.

HEADINGS: use natural "##" headings that come from THIS message's own ideas. Do NOT use label headings like "Opening Hook", "Main Theme", "Key Points", "Biblical Foundation", "Practical Application", or "Call to Action". A simple "## Questions to sit with" for the closing questions is fine.

LENGTH: long enough to genuinely cover everything above — usually 800 to 1200 words. Don't pad, and don't cut it short.
No emojis. No corporate filler. No "In conclusion". Output clean Markdown with NO title (the page already shows it). Start straight with the opening line.`;

  const maxTokens = hasTranscript ? 3600 : 2600;
  const temperature = hasTranscript ? 0.45 : 0.55;

  if (VIA === 'mistral') {
    const text = await withRetry(async () => {
      const r = await mistral.chat.complete({
        model: MISTRAL_WRITER, maxTokens, temperature,
        messages: [{ role: 'user', content: prompt }],
      });
      const c = r.choices?.[0]?.message?.content;
      return typeof c === 'string' ? c : Array.isArray(c) ? c.map((p) => p.text || '').join('') : '';
    });
    return text?.trim() || null;
  }

  const c = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  });
  return c.choices[0]?.message?.content?.trim() ?? null;
}

// Retry on transient rate limits (Mistral free tier throttles req/s + tokens/min).
async function withRetry(fn, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      const code = e?.statusCode || e?.status;
      if (code === 429 && i < tries - 1) {
        const wait = 4000 * (i + 1);
        console.log(`   rate limited, waiting ${wait / 1000}s…`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
}

async function embedBatch(texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += 32) {
    const res = await mistral.embeddings.create({ model: 'mistral-embed', inputs: texts.slice(i, i + 32).map((t) => t.slice(0, 8000)) });
    for (const r of res.data) out.push(r.embedding);
  }
  return out;
}

async function main() {
  const { data: sermons, error } = await sb
    .from('sermons')
    .select('id, slug, title, preacher, scripture_ref, transcript, notes, article')
    .order('service_date', { ascending: false });
  if (error) { console.error('Fetch sermons failed:', error.message); process.exit(1); }
  const list = ONLY.length ? sermons.filter((s) => ONLY.includes(s.slug)) : sermons;
  console.log(`Found ${sermons.length} sermons${ONLY.length ? `, processing ${list.length} matching --only` : ''}.\n`);

  let n = 0;
  for (const s of list) {
    n++;
    const tag = `[${n}/${list.length}] ${s.slug}`;
    try {
      // 1) Regenerate article (skip ones that already have a solid one).
      if (!EMBED_ONLY && (FORCE || !(s.article && s.article.trim().length > 200))) {
        const article = await generateArticle(s);
        if (article) {
          await sb.from('sermons').update({ article }).eq('id', s.id);
          s.article = article;
          console.log(`${tag} · article ${article.length} chars`);
        } else {
          console.log(`${tag} · no source for article, skipped`);
        }
        await sleep(400);
      }
      // 2) Embed
      if (!ARTICLES_ONLY) {
        const corpus = [s.transcript, s.article || s.notes].filter(Boolean).join('\n\n');
        const chunks = chunkText(corpus);
        await sb.from('sermon_chunks').delete().eq('sermon_id', s.id);
        if (chunks.length) {
          const embeddings = await embedBatch(chunks);
          const rows = chunks.map((content, i) => ({
            sermon_id: s.id, chunk_index: i, content, embedding: embeddings[i],
            metadata: { slug: s.slug, title: s.title },
          }));
          for (let i = 0; i < rows.length; i += 50) {
            const { error: e } = await sb.from('sermon_chunks').insert(rows.slice(i, i + 50));
            if (e) throw e;
          }
          console.log(`${tag} · embedded ${chunks.length} chunks`);
        }
        await sleep(300);
      }
    } catch (e) {
      console.error(`${tag} · ERROR:`, e.message || e);
    }
  }
  console.log('\nDone.');
}

main();
