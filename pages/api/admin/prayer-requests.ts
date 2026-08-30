import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor', 'leader'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'PUT') {
    const { id, status } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    if (!['pending', 'praying', 'answered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, praying, or answered' });
    }

    const { data, error } = await supabaseAdmin
      .from('prayer_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}
