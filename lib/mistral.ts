import { Mistral } from '@mistralai/mistralai';

/**
 * Mistral embeddings for RAG. `mistral-embed` → 1024-dim vectors,
 * matching the vector(1024) column + match_sermons() RPC in rag_and_upgrades.sql.
 * SERVER ONLY.
 */
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const EMBED_MODEL = 'mistral-embed';
export const EMBED_DIM = 1024;

export async function embed(text: string): Promise<number[]> {
  const res = await client.embeddings.create({ model: EMBED_MODEL, inputs: [text.slice(0, 8000)] });
  return res.data[0].embedding as number[];
}

export async function embedBatch(texts: string[], batchSize = 32): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map((t) => t.slice(0, 8000));
    const res = await client.embeddings.create({ model: EMBED_MODEL, inputs: batch });
    for (const row of res.data) out.push(row.embedding as number[]);
  }
  return out;
}

/** Split long text into overlapping, sentence-aware chunks for embedding. */
export function chunkText(text: string, chunkSize = 1400, overlap = 200): string[] {
  const clean = (text || '').replace(/\r\n/g, '\n').trim();
  if (!clean) return [];
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    if (end < clean.length) {
      const slice = clean.slice(start, end);
      const para = slice.lastIndexOf('\n\n');
      const sentence = slice.lastIndexOf('. ');
      const cut = para > chunkSize * 0.5 ? para : sentence > chunkSize * 0.5 ? sentence + 1 : -1;
      if (cut > 0) end = start + cut;
    }
    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end === clean.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}
