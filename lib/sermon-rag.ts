import { supabaseAdmin } from './supabase-admin';
import { embed, embedBatch, chunkText } from './mistral';

export interface SermonChunk {
  sermon_id: string;
  slug: string;
  title: string;
  preacher: string | null;
  content: string;
  similarity: number;
}

export interface RelevantSermon {
  id: string;
  title: string;
  preacher: string | null;
  slug: string;
  youtube_url: string | null;
  service_date: string | null;
  scripture_ref: string | null;
}

/** Embed the question and pull the nearest sermon passages via pgvector. */
export async function retrieveSermons(
  query: string,
  opts: { matchCount?: number; threshold?: number } = {},
): Promise<SermonChunk[]> {
  try {
    const queryEmbedding = await embed(query);
    const { data, error } = await supabaseAdmin.rpc('match_sermons', {
      query_embedding: queryEmbedding,
      match_count: opts.matchCount ?? 6,
      similarity_threshold: opts.threshold ?? 0.3,
    });
    if (error) {
      console.error('[sermon-rag] match_sermons error:', error.message);
      return [];
    }
    return (data as SermonChunk[]) ?? [];
  } catch (e) {
    console.error('[sermon-rag] retrieve error:', e);
    return [];
  }
}

/**
 * A prompt block built from the retrieved passages. Appended AFTER the church
 * knowledge base so the model answers from Ruach's actual preaching. Replaces
 * the old "stuff 25 sermon summaries into the prompt" (CAG) approach.
 */
export function buildRetrievedSermonsBlock(chunks: SermonChunk[]): string {
  if (!chunks.length) {
    return `\n\n### RELEVANT SERMONS\nNo specific sermon passage closely matched this question. Answer from general biblical/church guidance, and if it's a teaching topic, invite them to browse /sermons.\n`;
  }
  let block = `\n\n### RELEVANT SERMONS (retrieved passages — answer FROM these)
When a passage below speaks to the question, summarise what it teaches in plain words, then point to the sermon. Give the link as /slug using the exact slug shown. Do not invent sermons or quotes.\n\n`;
  chunks.forEach((c, i) => {
    block += `[${i + 1}] "${c.title}"${c.preacher ? ` — ${c.preacher}` : ''} | Watch: /${c.slug}\n${c.content.slice(0, 900)}\n\n`;
  });
  return block;
}

/**
 * (Re)build the pgvector index for a single sermon: chunk its transcript +
 * article/notes, embed, and replace any existing chunks. Called after a sermon
 * is saved in the control panel so "Ask Ruach" stays in sync — the runtime
 * equivalent of scripts/backfill-rag.mjs for one row. Returns the chunk count.
 */
export async function indexSermon(sermonId: string): Promise<number> {
  const { data: s, error } = await supabaseAdmin
    .from('sermons')
    .select('id, slug, title, transcript, article, notes')
    .eq('id', sermonId)
    .single();
  if (error || !s) throw error ?? new Error('Sermon not found');

  const corpus = [s.transcript, s.article || s.notes].filter(Boolean).join('\n\n');
  const chunks = chunkText(corpus);

  // Replace prior vectors even when there's nothing new to index.
  await supabaseAdmin.from('sermon_chunks').delete().eq('sermon_id', s.id);
  if (!chunks.length) return 0;

  const embeddings = await embedBatch(chunks);
  const rows = chunks.map((content, i) => ({
    sermon_id: s.id,
    chunk_index: i,
    content,
    embedding: embeddings[i],
    metadata: { slug: s.slug, title: s.title },
  }));
  for (let i = 0; i < rows.length; i += 50) {
    const { error: insErr } = await supabaseAdmin.from('sermon_chunks').insert(rows.slice(i, i + 50));
    if (insErr) throw insErr;
  }
  return chunks.length;
}

/** Dedupe retrieved chunks to sermon cards to attach to the chat answer. */
export async function findRelevantSermonsFromChunks(chunks: SermonChunk[]): Promise<RelevantSermon[]> {
  const slugs = Array.from(new Set(chunks.map((c) => c.slug).filter(Boolean))).slice(0, 3);
  if (!slugs.length) return [];
  const { data } = await supabaseAdmin
    .from('sermons')
    .select('id, title, preacher, slug, youtube_url, service_date, scripture_ref')
    .in('slug', slugs)
    .eq('published', true);
  if (!data) return [];
  // preserve retrieval order
  return slugs
    .map((slug) => (data as RelevantSermon[]).find((s) => s.slug === slug))
    .filter(Boolean) as RelevantSermon[];
}
