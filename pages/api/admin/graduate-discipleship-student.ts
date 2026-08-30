// pages/api/admin/graduate-discipleship-student.ts
// Admin action: mark a Discipleship student as having completed their level
// Eligibility (attendance % / exam avg vs cohort minimums) is computed here from
// discipleship_students' trigger-maintained columns, not trusted from the client.
// Protected: admin/pastor only

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendDiscipleshipGraduationNotice } from '@/lib/email';
import { notifyAndSMS } from '@/lib/notify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

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

  const { studentId } = req.body; // discipleship_students.id
  if (!studentId) return res.status(400).json({ error: 'studentId required' });

  const { data: student } = await supabaseAdmin
    .from('discipleship_students')
    .select(`
      id, user_id, level, status, total_attendance_percent, average_exam_score,
      profiles ( email, first_name ),
      discipleship_cohorts ( id, name, min_attendance_percent, min_exam_score )
    `)
    .eq('id', studentId)
    .single();

  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (student.status === 'completed') return res.status(400).json({ error: 'Already graduated.' });

  const cohort = (student as any).discipleship_cohorts;
  const eligible = cohort
    && student.total_attendance_percent >= cohort.min_attendance_percent
    && student.average_exam_score >= cohort.min_exam_score;
  if (!eligible) return res.status(400).json({ error: 'Student has not met graduation requirements.' });

  const profile = (student as any).profiles;
  const now = new Date().toISOString();

  await supabaseAdmin.from('discipleship_students').update({
    status: 'completed',
    graduated_at: now,
    certificate_issued: false,
  }).eq('id', studentId);

  try {
    await sendDiscipleshipGraduationNotice({
      to: profile.email,
      firstName: profile.first_name,
      level: student.level,
      cohortName: cohort.name,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    });
  } catch (emailErr) {
    console.error('Discipleship graduation email failed:', emailErr);
  }

  await notifyAndSMS({
    userId: student.user_id,
    type: 'graduation',
    title: `You completed Level ${student.level}! 🎓`,
    body: `Congratulations on completing ${cohort.name}.`,
    actionUrl: '/member',
    smsMessage: `Congratulations ${profile.first_name}! You have completed ${cohort.name}. View your progress at ruachtabernacle.org/member.`,
  });

  return res.status(200).json({ ok: true });
}
