// pages/api/email/discipleship-enrollment.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendDiscipleshipEnrollmentConfirmation } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, cohortId } = req.body;

  const { data: student } = await supabaseAdmin
    .from('discipleship_students')
    .select(`
      admission_number, level,
      profiles ( first_name, email ),
      discipleship_cohorts ( name, whatsapp_link )
    `)
    .eq('user_id', userId)
    .eq('cohort_id', cohortId)
    .single();

  if (!student) return res.status(404).json({ error: 'Not found' });

  const profile = (student as any).profiles;
  const cohort  = (student as any).discipleship_cohorts;

  try {
    await sendDiscipleshipEnrollmentConfirmation({
      to:              profile.email,
      firstName:       profile.first_name,
      admissionNumber: student.admission_number,
      cohortName:      cohort.name,
      level:           student.level,
      whatsappLink:    cohort.whatsapp_link ?? undefined,
    });
    res.status(200).json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
