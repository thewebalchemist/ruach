// pages/api/admin/graduate-connect-student.ts
// Admin action: mark a Connect student as graduated → assign member ID
// Also upgrades their profile role from 'student' to 'member'
// Protected: admin/pastor only

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendConnectGraduationNotice } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verify the caller is admin/pastor via their session token
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'pastor'].includes(callerProfile?.role ?? '')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { studentId } = req.body; // connect_students.id
  if (!studentId) return res.status(400).json({ error: 'studentId required' });

  // Fetch student record
  const { data: student } = await supabaseAdmin
    .from('connect_students')
    .select(`
      id, user_id, can_graduate, status,
      profiles ( email, first_name, role ),
      connect_cohorts ( id, name )
    `)
    .eq('id', studentId)
    .single();

  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (!student.can_graduate) return res.status(400).json({ error: 'Student has not met graduation requirements.' });
  if (student.status === 'completed') return res.status(400).json({ error: 'Already graduated.' });

  const userId  = student.user_id;
  const profile = (student as any).profiles;
  const cohort  = (student as any).connect_cohorts;

  // Generate member ID
  const { data: memberId } = await supabaseAdmin.rpc('generate_member_id', { p_is_legacy: false });

  const now = new Date().toISOString();

  // 1. Mark connect student as completed
  await supabaseAdmin.from('connect_students').update({
    status: 'completed',
    graduated_at: now,
    certificate_issued: true,
  }).eq('id', studentId);

  // 2. Upgrade profile: assign member ID, set role to 'member'
  await supabaseAdmin.from('profiles').update({
    role:                 'member',
    member_id:            memberId,
    member_since:         now.split('T')[0],
    connect_cohort_id:    cohort.id,
    connect_graduated_at: now,
  }).eq('id', userId);

  // 3. Send graduation email
  try {
    await sendConnectGraduationNotice({
      to:        profile.email,
      firstName: profile.first_name,
      memberId:  memberId!,
      cohortName: cohort.name,
      appUrl:    process.env.NEXT_PUBLIC_APP_URL!,
    });
  } catch (emailErr) {
    console.error('Graduation email failed:', emailErr);
    // Non-fatal — graduation already recorded
  }

  return res.status(200).json({ ok: true, memberId });
}
