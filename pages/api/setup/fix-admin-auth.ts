// pages/api/setup/fix-admin-auth.ts
// Fixes an admin account that was created without a password provider.
// Run once: POST /api/setup/fix-admin-auth  with x-setup-secret header.
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

const ADMIN_EMAIL    = 'admin@ruachtabernacle.org';
const ADMIN_PASSWORD = 'RuachAdmin2026!';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = process.env.SETUP_SECRET;
  if (!secret || req.headers['x-setup-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized — include x-setup-secret header' });
  }

  const steps: string[] = [];

  // 1. Find the existing admin user by email
  const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) return res.status(500).json({ error: listErr.message, steps });

  const adminUser = userList?.users?.find(u => u.email === ADMIN_EMAIL);
  if (!adminUser) {
    return res.status(404).json({
      error: 'Admin user not found. Run /api/setup/create-admin first.',
      steps,
    });
  }
  steps.push(`found-user: ${adminUser.id} | providers: [${adminUser.app_metadata?.providers ?? 'none'}]`);

  // 2. Update the user — this registers the email provider and sets the password hash
  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
    password:      ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (updateErr) {
    steps.push(`update-user: ERR ${updateErr.message}`);
    // If update fails, delete and recreate
    steps.push('falling back to delete + recreate');

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(adminUser.id);
    steps.push(`delete-user: ${delErr ? `ERR ${delErr.message}` : 'ok'}`);

    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email:         ADMIN_EMAIL,
      password:      ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: 'Admin', last_name: 'Ruach', role: 'admin' },
    });

    if (createErr || !newUser?.user) {
      steps.push(`recreate-user: ERR ${createErr?.message}`);
      return res.status(500).json({ error: createErr?.message, steps });
    }
    steps.push(`recreate-user: ok — new uid ${newUser.user.id}`);

    // Re-upsert profile for new uid
    const { error: profileErr } = await supabaseAdmin.from('profiles').upsert({
      id:         newUser.user.id,
      email:      ADMIN_EMAIL,
      first_name: 'Admin',
      last_name:  'Ruach',
      role:       'admin',
      status:     'active',
      member_id:  null,
    }, { onConflict: 'id' });
    steps.push(`upsert-profile: ${profileErr ? `ERR ${profileErr.message}` : 'ok'}`);

    return res.status(200).json({
      success: true, steps,
      note: 'User was recreated (update failed). Old user ID is gone.',
      credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, loginUrl: '/auth/login' },
    });
  }

  steps.push('update-user: ok — password + email provider registered');

  // 3. Fix the profile: set status → active and role → admin (belt-and-suspenders)
  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'active', role: 'admin' })
    .eq('id', adminUser.id);
  steps.push(`fix-profile: ${profileErr ? `ERR ${profileErr.message}` : 'ok'}`);

  // 4. Verify the fix by checking providers on the updated user
  const { data: { user: fixed } } = await supabaseAdmin.auth.admin.getUserById(adminUser.id);
  const providers = (fixed?.app_metadata as any)?.providers ?? [];
  steps.push(`verify-providers: [${providers.join(', ') || 'STILL EMPTY — recreate may be needed'}]`);

  return res.status(200).json({
    success: true,
    steps,
    credentials: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, loginUrl: '/auth/login' },
  });
}
