// pages/api/setup/seed-test-accounts.ts
// ONE-TIME USE: Creates the 4 test accounts.
// Protected by SETUP_SECRET env var. Delete this file after use.
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

const TEST_ACCOUNTS = [
  { email: 'test.student@ruachtabernacle.org',  password: 'TestStudent2026!', role: 'student',  member_id: null,          first_name: 'Test', last_name: 'Student' },
  { email: 'test.member@ruachtabernacle.org',   password: 'TestMember2026!',  role: 'member',   member_id: 'MBR-TEST-001', first_name: 'Test', last_name: 'Member'  },
  { email: 'test.teacher@ruachtabernacle.org',  password: 'TestTeacher2026!', role: 'teacher',  member_id: 'MBR-TEST-002', first_name: 'Test', last_name: 'Teacher' },
  { email: 'test.admin@ruachtabernacle.org',    password: 'TestAdmin2026!',   role: 'admin',    member_id: 'MBR-TEST-003', first_name: 'Test', last_name: 'Admin'   },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Never reachable in production, regardless of secret — this endpoint creates
  // an account with password 'TestAdmin2026!' and role 'admin'; it must only
  // ever run against a staging/dev database.
  if (process.env.NODE_ENV === 'production') return res.status(404).end();

  const secret = process.env.SETUP_SECRET;
  if (!secret || req.headers['x-setup-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // --- Diagnostic: list all users so we can see what exists ---
  const { data: allUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existingEmails = allUsers?.users?.map(u => u.email) ?? [];

  const results: Record<string, unknown>[] = [];

  for (const account of TEST_ACCOUNTS) {
    const steps: string[] = [];

    // 1. Delete orphaned profile rows by email
    const { data: deletedProfiles, error: profileDelErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('email', account.email)
      .select('id, email');
    steps.push(`profile-delete: ${profileDelErr ? `ERR ${profileDelErr.message}` : `removed ${deletedProfiles?.length ?? 0} row(s)`}`);

    // 2. Delete existing auth user if any
    const old = allUsers?.users?.find(u => u.email === account.email);
    if (old) {
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(old.id);
      steps.push(`auth-delete: ${delErr ? `ERR ${delErr.message}` : 'ok'}`);
    } else {
      steps.push('auth-delete: no existing user found');
    }

    // 3. Verify profiles are really gone
    const { data: remaining } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', account.email);
    steps.push(`profiles-remaining: ${remaining?.length ?? 'unknown'}`);

    // 4. Create fresh user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        first_name: account.first_name,
        last_name:  account.last_name,
        role:       account.role,
      },
    });

    if (error || !data?.user) {
      steps.push(`create-user: ERR — ${error?.message} | ${JSON.stringify(error)}`);
      results.push({ email: account.email, status: 'error', steps });
      continue;
    }
    steps.push(`create-user: ok — uid ${data.user.id}`);

    // 5. Upsert profile with correct role + member_id
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id:         data.user.id,
        email:      account.email,
        first_name: account.first_name,
        last_name:  account.last_name,
        role:       account.role,
        member_id:  account.member_id,
      }, { onConflict: 'id' });

    steps.push(`profile-upsert: ${profileErr ? `ERR ${profileErr.message}` : 'ok'}`);
    results.push({ email: account.email, status: profileErr ? 'partial' : 'ok', steps });
  }

  return res.status(200).json({ listErr: listErr?.message, existingEmails, results });
}
