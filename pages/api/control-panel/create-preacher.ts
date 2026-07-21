import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor', 'media'];

/**
 * Add a preacher to the managed `preachers` list that feeds the sermon-form
 * dropdown. Idempotent on slug so re-adding an existing name just returns it.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  const { name, title } = req.body as { name?: string; title?: string };
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const clean = name.trim();
  const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Return the existing row if this preacher already exists.
  const { data: existing } = await supabaseAdmin
    .from('preachers')
    .select('id, name, title')
    .eq('slug', slug)
    .maybeSingle();
  if (existing) return res.status(200).json(existing);

  const { data, error } = await supabaseAdmin
    .from('preachers')
    .insert({ name: clean, slug, title: title?.trim() || null })
    .select('id, name, title')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json(data);
}
