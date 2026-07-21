import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile } from '@/lib/api-auth';
import { indexSermon } from '@/lib/sermon-rag';

const ALLOWED = ['admin', 'pastor', 'media'];

/**
 * Rebuild the RAG vector index for one sermon after it's saved, so "Ask Ruach"
 * can answer from it. Best-effort: the client fires this after a successful
 * save and does not block the save on it.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  const { id } = req.body as { id?: string };
  if (!id) return res.status(400).json({ error: 'Sermon id is required' });
  if (!process.env.MISTRAL_API_KEY) {
    return res.status(503).json({ error: 'Embedding service not configured' });
  }

  try {
    const chunks = await indexSermon(id);
    return res.status(200).json({ chunks });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to index sermon';
    console.error('[embed-sermon]', msg);
    return res.status(500).json({ error: msg });
  }
}
