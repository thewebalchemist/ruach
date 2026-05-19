// pages/api/admin/verify-legacy-request.ts
// Admin action: approve/reject a legacy member request
// On approval: generates member_id and sends email

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendLegacyVerificationResult } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'pastor'].includes(callerProfile?.role ?? '')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { requestId, status, notes } = req.body;
  if (!requestId || !status) return res.status(400).json({ error: 'requestId and status required' });
  if (!['verified', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const { data: request } = await supabaseAdmin
    .from('legacy_member_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!request) return res.status(404).json({ error: 'Request not found' });

  let memberId: string | undefined;

  if (status === 'verified') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    memberId = await supabaseAdmin.rpc('generate_member_id', { p_is_legacy: true }).then((r: any) => r.data as string);
    const now = new Date().toISOString();

    // Update or create profile for the requester
    if (request.user_id) {
      await supabaseAdmin.from('profiles').update({
        role:             'member',
        member_id:        memberId,
        member_since:     now.split('T')[0],
        is_legacy_member: true,
      }).eq('id', request.user_id);
    }

    // Update legacy request record
    await supabaseAdmin.from('legacy_member_requests').update({
      status:             'verified',
      reviewed_by:        user.id,
      reviewed_at:        now,
      review_notes:       notes ?? null,
      assigned_member_id: memberId,
    }).eq('id', requestId);
  } else {
    await supabaseAdmin.from('legacy_member_requests').update({
      status:       'rejected',
      reviewed_by:  user.id,
      reviewed_at:  new Date().toISOString(),
      review_notes: notes ?? null,
    }).eq('id', requestId);
  }

  // Send email
  try {
    const firstName = request.full_name.split(' ')[0];
    await sendLegacyVerificationResult({
      to:        request.email,
      firstName,
      status,
      memberId,
      notes,
      appUrl:    process.env.NEXT_PUBLIC_APP_URL!,
    });
  } catch (e) {
    console.error('Legacy email failed:', e);
  }

  return res.status(200).json({ ok: true, memberId });
}
