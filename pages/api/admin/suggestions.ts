import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'PUT') {
    const { id, status, admin_response } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (admin_response !== undefined) updates.admin_response = admin_response;

    const { data, error } = await supabaseAdmin
      .from('suggestions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}
