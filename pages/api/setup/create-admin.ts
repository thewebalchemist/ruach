// ONE-TIME USE — creates the main admin account
// Protected by SETUP_SECRET. Delete this file after use.
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

  // 1. Remove any orphaned profile row for this email (safe if none exist)
  const { error: profileDelErr } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('email', ADMIN_EMAIL);
  steps.push(`clean-profiles: ${profileDelErr ? `WARN ${profileDelErr.message}` : 'ok'}`);

  // 2. Remove existing auth user if any
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const existing = userList?.users?.find(u => u.email === ADMIN_EMAIL);
  if (existing) {
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
    steps.push(`delete-old-user: ${delErr ? `ERR ${delErr.message}` : 'ok'}`);
  } else {
    steps.push('delete-old-user: none found');
  }

  // 3. Create fresh auth user (with metadata so trigger has what it needs)
  const { data, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email:         ADMIN_EMAIL,
    password:      ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: 'Admin',
      last_name:  'Ruach',
      role:       'admin',
    },
  });

  if (createErr || !data?.user) {
    steps.push(`create-user: ERR — ${createErr?.message}`);
    return res.status(500).json({ error: createErr?.message, steps });
  }
  steps.push(`create-user: ok — uid ${data.user.id}`);

  // 4. Upsert profile with all required fields
  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id:         data.user.id,
      email:      ADMIN_EMAIL,
      first_name: 'Admin',
      last_name:  'Ruach',
      role:       'admin',
      status:     'active',
      member_id:  null,
    }, { onConflict: 'id' });

  steps.push(`upsert-profile: ${profileErr ? `ERR ${profileErr.message}` : 'ok'}`);

  if (profileErr) {
    return res.status(500).json({ error: profileErr.message, steps });
  }

  return res.status(200).json({
    success: true,
    steps,
    credentials: {
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      loginUrl: '/auth/login',
    },
  });
}
