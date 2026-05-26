// pages/api/dev/seed-test-user.ts
// ONE-TIME dev helper — creates a fully-privileged test account
// Hit: GET /api/dev/seed-test-user
// DELETE THIS FILE after use.

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const EMAIL    = 'test@ruachtabernacle.org';
  const PASSWORD = 'Test@1234!';

  try {
    // ── 1. Clean up any previous broken attempt ───────────────
    // Query profiles (more reliable than listUsers pagination)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', EMAIL)
      .maybeSingle();

    if (existingProfile?.id) {
      await supabaseAdmin.auth.admin.deleteUser(existingProfile.id);
      // Give cascade a moment to complete
      await new Promise(r => setTimeout(r, 800));
    }

    // ── 2. Create via admin API (correct GoTrue flow) ─────────
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,            // no email verification needed
      user_metadata: { first_name: 'Test', last_name: 'Account' },
    });

    if (createErr || !created.user) {
      return res.status(500).json({ error: createErr?.message ?? 'User creation failed' });
    }

    const uid = created.user.id;

    // ── 3. Promote profile to admin ───────────────────────────
    // generate_member_id is a DB function — call it via RPC
    const { data: memberIdRow } = await supabaseAdmin.rpc('generate_member_id', { p_is_legacy: false });
    const memberId = memberIdRow as string;

    await supabaseAdmin.from('profiles').update({
      role:                 'admin',
      status:               'active',
      first_name:           'Test',
      last_name:            'Account',
      member_id:            memberId,
      member_since:         new Date().toISOString().slice(0, 10),
      branch:               'Nairobi',
      connect_graduated_at: new Date().toISOString(),
      onboarding_complete:  true,
    }).eq('id', uid);

    // ── 4. Connect cohort ─────────────────────────────────────
    let { data: cohorts } = await supabaseAdmin
      .from('connect_cohorts')
      .select('id')
      .in('status', ['active', 'registration-open', 'completed'])
      .order('year', { ascending: false })
      .limit(1);

    let connectCohortId: string;

    if (cohorts && cohorts.length > 0) {
      connectCohortId = cohorts[0].id;
    } else {
      const { data: newCohort } = await supabaseAdmin.from('connect_cohorts').insert({
        name: 'Connect Class 2025 — Cohort 1',
        year: 2025, cohort_number: 1,
        description: 'Dev seed cohort',
        start_date: '2025-01-01', end_date: '2025-04-30',
        registration_deadline: '2024-12-31', status: 'completed',
      }).select('id').single();
      connectCohortId = newCohort!.id;
    }

    await supabaseAdmin.from('profiles').update({ connect_cohort_id: connectCohortId }).eq('id', uid);

    const { data: admNum } = await supabaseAdmin.rpc('generate_connect_admission_number', { p_year: 2025 });
    await supabaseAdmin.from('connect_students').upsert({
      user_id: uid, cohort_id: connectCohortId,
      admission_number: admNum as string,
      preferred_class_type: 'virtual', accepted_jesus: 'yes',
      status: 'completed', total_attendance_percent: 100,
      average_exam_score: 92, can_graduate: true,
      graduated_at: new Date().toISOString(), certificate_issued: true,
    }, { onConflict: 'user_id,cohort_id' });

    // ── 5. Discipleship cohort ────────────────────────────────
    let { data: discCohorts } = await supabaseAdmin
      .from('discipleship_cohorts')
      .select('id')
      .eq('level', 1)
      .in('status', ['active', 'registration-open', 'completed'])
      .order('year', { ascending: false })
      .limit(1);

    let discCohortId: string;

    if (discCohorts && discCohorts.length > 0) {
      discCohortId = discCohorts[0].id;
    } else {
      const { data: courses } = await supabaseAdmin
        .from('discipleship_courses').select('id').eq('level', 1).single();
      const { data: newDisc } = await supabaseAdmin.from('discipleship_cohorts').insert({
        course_id: courses!.id, level: 1,
        name: 'KDC Level 1 — 2025 Cohort', year: 2025,
        start_date: '2025-01-01', end_date: '2025-06-30',
        registration_deadline: '2024-12-31',
        schedule: 'Saturdays 9AM–12PM', status: 'active',
      }).select('id').single();
      discCohortId = newDisc!.id;
    }

    const { data: kdcNum } = await supabaseAdmin.rpc('generate_discipleship_admission_number', { p_year: 2025 });
    await supabaseAdmin.from('discipleship_students').upsert({
      user_id: uid, cohort_id: discCohortId, level: 1,
      admission_number: kdcNum as string,
      status: 'in-progress', total_attendance_percent: 90,
      average_exam_score: 80,
    }, { onConflict: 'user_id,cohort_id' });

    // ── 6. Crosspoint leader ──────────────────────────────────
    let { data: crosspoints } = await supabaseAdmin
      .from('crosspoints').select('id').eq('status', 'active').limit(1);

    let crosspointId: string;

    if (crosspoints && crosspoints.length > 0) {
      crosspointId = crosspoints[0].id;
    } else {
      const { data: newCp } = await supabaseAdmin.from('crosspoints').insert({
        name: 'Test Crosspoint — Nairobi South',
        zone: 'south', area: 'Nairobi South',
        location: 'Nairobi', status: 'active',
      }).select('id').single();
      crosspointId = newCp!.id;
    }

    await supabaseAdmin.from('crosspoint_memberships').upsert({
      user_id: uid, crosspoint_id: crosspointId,
      role: 'leader', joined_date: new Date().toISOString().slice(0, 10), status: 'active',
    }, { onConflict: 'user_id,crosspoint_id' });

    await supabaseAdmin.from('crosspoints').update({ leader_id: uid }).eq('id', crosspointId);

    return res.status(200).json({
      success: true,
      credentials: { email: EMAIL, password: PASSWORD },
      uid,
      member_id: memberId,
      role: 'admin',
      access: ['member-dashboard', 'connect', 'discipleship', 'crosspoint-leader', 'control-panel'],
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
