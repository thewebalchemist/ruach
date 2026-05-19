// pages/api/email/connect-registration.ts
// Called after a student successfully registers for Connect Class

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendConnectRegistrationConfirmation } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  // Fetch student + cohort info
  const { data: student } = await supabaseAdmin
    .from('connect_students')
    .select(`
      admission_number,
      profiles ( first_name, email ),
      connect_cohorts ( name, whatsapp_link )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })
    .limit(1)
    .single();

  if (!student) return res.status(404).json({ error: 'Student not found' });

  const profile = (student as any).profiles;
  const cohort  = (student as any).connect_cohorts;

  try {
    await sendConnectRegistrationConfirmation({
      to:              profile.email,
      firstName:       profile.first_name,
      admissionNumber: student.admission_number,
      cohortName:      cohort.name,
      whatsappLink:    cohort.whatsapp_link ?? undefined,
    });
    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Email error:', err);
    res.status(500).json({ error: err.message });
  }
}
