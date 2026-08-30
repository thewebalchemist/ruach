// pages/api/admin/create-staff-user.ts
// Admin action: create a teacher/leader/admin/pastor account with a temp password.
// Protected: admin/pastor only (pastor since this can grant admin-level access).

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendStaffAccountCreated } from '@/lib/email';
import { toE164 } from '@/lib/phone';
import { passwordMeetsPolicy, unmetPasswordRules } from '@/lib/password';

const ROLE_LABELS: Record<string, string> = {
  teacher: 'Teacher', leader: 'Leader / HoD', admin: 'Admin', pastor: 'Pastor / Senior Leader',
};

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
    firstName, lastName, email, phone, role, gender, dateOfBirth,
    branch, crosspointId, departmentId, tempPassword, sendWelcome,
  } = req.body;

  if (!firstName || !lastName || !email || !tempPassword) {
    return res.status(400).json({ error: 'firstName, lastName, email, and tempPassword are required' });
  }
  if (!['teacher', 'leader', 'admin', 'pastor'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (!passwordMeetsPolicy(tempPassword)) {
    return res.status(400).json({ error: unmetPasswordRules(tempPassword)[0] ?? 'Password does not meet policy' });
  }

  const normalizedPhone = phone ? toE164(phone) : undefined;

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    phone: normalizedPhone,
    password: tempPassword,
    email_confirm: true,
    phone_confirm: !!normalizedPhone,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (createErr || !created.user) {
    return res.status(400).json({ error: createErr?.message ?? 'Failed to create account' });
  }

  const userId = created.user.id;

  const { error: updateErr } = await supabaseAdmin.from('profiles').update({
    role,
    status: 'active',
    gender: gender || null,
    date_of_birth: dateOfBirth || null,
    branch: branch || 'Nairobi',
  }).eq('id', userId);
  if (updateErr) return res.status(500).json({ error: updateErr.message });

  if (role === 'leader' && crosspointId) {
    await supabaseAdmin.from('crosspoints').update({ leader_id: userId }).eq('id', crosspointId);
    await supabaseAdmin.from('crosspoint_memberships').upsert({
      user_id: userId, crosspoint_id: crosspointId, role: 'leader', status: 'active',
    }, { onConflict: 'user_id,crosspoint_id' });
  }

  if (departmentId) {
    await supabaseAdmin.from('department_memberships').upsert({
      user_id: userId, department_id: departmentId,
      role: role === 'leader' ? 'leader' : 'member', status: 'active',
    }, { onConflict: 'user_id,department_id' });
  }

  if (sendWelcome) {
    try {
      await sendStaffAccountCreated({
        to: email, firstName, roleLabel: ROLE_LABELS[role], tempPassword,
        appUrl: process.env.NEXT_PUBLIC_APP_URL!,
      });
    } catch (emailErr) {
      console.error('Staff welcome email failed:', emailErr);
    }
  }

  return res.status(200).json({ ok: true, userId });
}
