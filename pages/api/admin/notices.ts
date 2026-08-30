import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'POST') {
    const { title, content, scope, target_id, priority, expires_at } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

    const { data, error } = await supabaseAdmin.from('notices').insert({
      title,
      content,
      scope: scope || 'all',
      target_id: target_id || null,
      priority: priority || 'medium',
      expires_at: expires_at || null,
      author_id: profile.id,
      published_at: new Date().toISOString(),
    }).select().single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id, ...fields } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { data, error } = await supabaseAdmin.from('notices').update(fields).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { error } = await supabaseAdmin.from('notices').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
