import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor', 'teacher'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'POST') {
    const { data, error } = await supabaseAdmin.from('connect_sessions').insert(req.body).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'PUT') {
    const { id, ...fields } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { data, error } = await supabaseAdmin.from('connect_sessions').update(fields).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
