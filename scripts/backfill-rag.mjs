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

async function generateArticle(s) {
  const fromTranscript = (s.transcript || '').trim().length > 200;
  const source = fromTranscript ? s.transcript : (s.notes || '');
  if (!source.trim()) return null;
  const prompt = `Write an article capturing the sermon "${s.title}" preached by ${s.preacher || 'the preacher'} at Ruach Tabernacle.${s.scripture_ref ? ` Anchor scripture: ${s.scripture_ref}.` : ''}

Source (${fromTranscript ? 'full transcript' : 'existing notes'} — everything must come from it; invent nothing):
--- SOURCE START ---
${source.trim().slice(0, 14000)}
--- SOURCE END ---

Write it the way a sharp church editor would write up a message they were moved by — not a template. Open with a real hook from the message (never "In this powerful sermon…"). Flow as prose with a few natural ## subheadings drawn from THIS sermon (never a fixed checklist). Pull one quotable line into a > blockquote in the preacher's words. Name scripture where opened. Land on a challenge or invitation (don't label it). Warm, plain, courageous, ~500-750 words. No emojis, no filler, no "In conclusion". Output clean Markdown body only (no title).`;
  const c = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2600,
    temperature: fromTranscript ? 0.3 : 0.5,
    messages: [{ role: 'user', content: prompt }],
  });
  return c.choices[0]?.message?.content?.trim() ?? null;
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
  console.log(`Found ${sermons.length} sermons.\n`);

  let n = 0;
  for (const s of sermons) {
    n++;
    const tag = `[${n}/${sermons.length}] ${s.slug}`;
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
