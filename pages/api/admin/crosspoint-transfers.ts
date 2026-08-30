import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ['admin', 'pastor']);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'PUT') {
    const { id, status } = req.body;
    if (!id || !['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'id and status (approved|declined) required' });
    }

    // Update the transfer request
    const { data: transfer, error: updateErr } = await supabaseAdmin
      .from('transfer_requests')
      .update({ status, reviewed_by: profile.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    // If approved, move the crosspoint membership
    if (status === 'approved' && transfer) {
      // Remove from old crosspoint
      await supabaseAdmin
        .from('crosspoint_memberships')
        .delete()
        .eq('user_id', transfer.user_id)
        .eq('crosspoint_id', transfer.from_crosspoint_id);

      // Add to new crosspoint
      await supabaseAdmin
        .from('crosspoint_memberships')
        .insert({
          user_id: transfer.user_id,
          crosspoint_id: transfer.to_crosspoint_id,
          role: 'member',
        });
    }

    return res.status(200).json(transfer);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
