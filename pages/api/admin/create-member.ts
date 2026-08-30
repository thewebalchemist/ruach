// pages/api/admin/create-member.ts
// Admin action: manually create a member record (walk-in / paper registration).
// Creates a real auth.users row (profiles is populated by the on_auth_user_created
// trigger) so the member can later log in via phone/email OTP, then patches the
// extra profile fields the trigger doesn't set. Protected: admin/pastor only.

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toE164 } from '@/lib/phone';
import { virtualEmail } from '@/lib/phone-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'pastor'].includes(callerProfile?.role ?? '')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const {
    firstName, lastName, phone, email, gender, dateOfBirth, address,
    occupation, maritalStatus, role, crosspointId,
  } = req.body;

  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ error: 'firstName, lastName, and phone are required' });
  }

  const normalizedPhone = toE164(phone);
  const finalEmail = email?.trim() || virtualEmail(normalizedPhone);

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: finalEmail,
    phone: normalizedPhone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (createErr || !created.user) {
    return res.status(400).json({ error: createErr?.message ?? 'Failed to create member account' });
  }

  const userId = created.user.id;
  const { data: memberId } = await supabaseAdmin.rpc('generate_member_id', { p_is_legacy: false });
  const now = new Date().toISOString();

  const { error: updateErr } = await supabaseAdmin.from('profiles').update({
    gender: gender || null,
    date_of_birth: dateOfBirth || null,
    address: address || null,
    occupation: occupation || null,
    marital_status: maritalStatus || null,
    role: role || 'member',
    status: 'active',
    member_id: memberId,
    member_since: now.split('T')[0],
  }).eq('id', userId);
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  if (crosspointId) {
    await supabaseAdmin.from('crosspoint_memberships').upsert({
      user_id: userId, crosspoint_id: crosspointId, role: 'member', status: 'active',
    }, { onConflict: 'user_id,crosspoint_id' });
  }

  return res.status(200).json({ ok: true, userId, memberId });
}
