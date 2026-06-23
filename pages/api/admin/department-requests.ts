import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'PUT') {
    const { id, status } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or declined' });
    }

    // Update the join request
    const { data: request, error: updateError } = await supabaseAdmin
      .from('department_join_requests')
      .update({
        status,
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) return res.status(400).json({ error: updateError.message });

    // On approve, insert into department_memberships
    if (status === 'approved' && request) {
      const { error: membershipError } = await supabaseAdmin
        .from('department_memberships')
        .insert({
          user_id: request.user_id,
          department_id: request.department_id,
          sub_team_id: request.sub_team_id || null,
          role: 'member',
          status: 'active',
          joined_date: new Date().toISOString(),
        });

      if (membershipError) {
        // Log but don't fail — the request was already updated
        console.error('Failed to insert department membership:', membershipError.message);
      }
    }

    return res.status(200).json(request);
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}
