import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile } from '@/lib/api-auth';
import { generateSermonArticle } from '@/lib/sermon-article';

const ALLOWED = ['admin', 'pastor', 'media'];

/**
 * Generate a JK-style editorial sermon ARTICLE (+ short description) from the
 * transcript, or from existing notes when there's no transcript. This is the
 * primary human-readable text on the sermon page and the RAG source.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  const { title, preacher, scripture, summary, transcript, notes } = req.body as {
    title?: string;
    preacher?: string;
    scripture?: string;
    summary?: string;
    transcript?: string;
    notes?: string;
  };

  if (!title || !preacher) {
    return res.status(400).json({ error: 'title and preacher are required' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'AI service not configured' });
  }
  if (!(transcript && transcript.trim().length > 200) && !(notes && notes.trim())) {
    return res.status(400).json({ error: 'Add a transcript (or existing notes) for the AI to write from.' });
  }

  try {
    const { article, description } = await generateSermonArticle({ title, preacher, scripture, summary, transcript, notes });
    if (!article) return res.status(502).json({ error: 'The AI returned nothing — try again.' });
    return res.status(200).json({ article, description });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate article';
    console.error('[generate-article]', msg);
    // Surface Groq daily-limit clearly so the admin knows to retry later.
    const rateLimited = /rate limit|tokens per day|TPD|429/i.test(msg);
    return res.status(rateLimited ? 429 : 500).json({
      error: rateLimited ? 'AI daily limit reached — try again later or save with notes for now.' : 'Failed to generate article',
    });
  }
}
