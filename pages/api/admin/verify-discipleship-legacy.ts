// pages/api/admin/verify-discipleship-legacy.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendDiscipleshipLegacyResult } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'pastor'].includes(callerProfile?.role ?? ''))
    return res.status(403).json({ error: 'Forbidden' });

  const { requestId, status, notes } = req.body;
  if (!requestId || !status) return res.status(400).json({ error: 'requestId and status required' });

  const { data: request } = await supabaseAdmin
    .from('discipleship_legacy_requests')
    .select('*, profiles(email, first_name)')
    .eq('id', requestId)
    .single();

  if (!request) return res.status(404).json({ error: 'Not found' });

  const now = new Date().toISOString();

  await supabaseAdmin.from('discipleship_legacy_requests').update({
    status,
    reviewed_by:  user.id,
    reviewed_at:  now,
    review_notes: notes ?? null,
  }).eq('id', requestId);

  // If verified, we just mark it — no extra DB changes needed
  // The badge display reads from the legacy_requests table

  const profile = (request as any).profiles;
  if (profile) {
    try {
      await sendDiscipleshipLegacyResult({
        to:        profile.email,
        firstName: profile.first_name,
        status,
        level:     request.level,
        notes,
      });
    } catch (e) {
      console.error('Discipleship legacy email failed:', e);
    }
  }

  return res.status(200).json({ ok: true });
}
