// pages/api/setup/diagnose.ts — DELETE AFTER USE
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Never reachable in production, regardless of secret — this endpoint creates
  // and deletes real auth users to diagnose signup issues; staging/dev only.
  if (process.env.NODE_ENV === 'production') return res.status(404).end();

  if (req.headers['x-setup-secret'] !== process.env.SETUP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const diagnostics: Record<string, unknown> = {};

  // 1. Can we read profiles?
  const { data: profiles, error: profilesErr } = await supabaseAdmin
    .from('profiles').select('id, email, role, member_id').limit(5);
  diagnostics.profiles = { data: profiles, error: profilesErr?.message };

  // 2. Try creating a minimal user with NO metadata
  const testEmail = `diag-${Date.now()}@ruachtabernacle.org`;
  const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: 'Diag!2025Test',
    email_confirm: true,
  });
  diagnostics.create_user = {
    email: testEmail,
    success: !!newUser?.user,
    error: createErr ? { message: createErr.message, code: (createErr as {code?:string}).code } : null,
    user_id: newUser?.user?.id,
  };

  // 3. If user was created, check if profile was created by trigger
  if (newUser?.user?.id) {
    const { data: triggerProfile } = await supabaseAdmin
      .from('profiles').select('*').eq('id', newUser.user.id).single();
    diagnostics.trigger_profile = triggerProfile;

    // Clean up the test user
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
    diagnostics.cleanup = 'deleted test user';
  }

  return res.status(200).json(diagnostics);
}
