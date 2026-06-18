// pages/api/control-panel/invite-member.ts
// Creates a new staff account (media, teacher, leader, pastor).
// Caller must be authenticated as admin or pastor.
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';

const INVITABLE_ROLES = ['media', 'teacher', 'leader', 'pastor'] as const;
type InvitableRole = typeof INVITABLE_ROLES[number];

function generatePassword(): string {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const syms   = '!@#';
  const all    = upper + lower + digits + syms;
  const rand   = (set: string) => set[Math.floor(Math.random() * set.length)];
  const base   = Array.from({ length: 12 }, () => rand(all));
  // Guarantee at least one of each class
  base[0] = rand(upper);
  base[1] = rand(lower);
  base[2] = rand(digits);
  base[3] = rand(syms);
  return base.sort(() => Math.random() - 0.5).join('');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Verify the caller has an active session and is admin/pastor
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing authorization header' });

  const callerClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user: caller } } = await callerClient.auth.getUser(token);
  if (!caller) return res.status(401).json({ error: 'Invalid session' });

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role, status')
    .eq('id', caller.id)
    .single();

  if (!callerProfile || !['admin', 'pastor'].includes(callerProfile.role) || callerProfile.status === 'suspended') {
    return res.status(403).json({ error: 'Only admins and pastors can invite team members' });
  }

  const { firstName, lastName, email, role } = req.body as {
    firstName: string; lastName: string; email: string; role: string;
  };

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !role) {
    return res.status(400).json({ error: 'firstName, lastName, email, and role are required' });
  }

  if (!INVITABLE_ROLES.includes(role as InvitableRole)) {
    return res.status(400).json({ error: `Role must be one of: ${INVITABLE_ROLES.join(', ')}` });
  }

  // Check if a user with this email already exists
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const existing = userList?.users?.find(u => u.email === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const password = generatePassword();

  // Create the auth user (email_confirm: true so they can log in immediately)
  const { data, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email:         email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      role,
    },
  });

  if (createErr || !data?.user) {
    return res.status(500).json({ error: createErr?.message ?? 'Failed to create user' });
  }

  // Upsert profile to confirm role (the DB trigger may have already created it)
  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id:         data.user.id,
      email:      email.trim().toLowerCase(),
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      role,
      status:     'active',
    }, { onConflict: 'id' });

  if (profileErr) {
    // Auth user exists but profile failed — clean up and report
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return res.status(500).json({ error: `Profile creation failed: ${profileErr.message}` });
  }

  return res.status(200).json({
    success: true,
    member: {
      id:        data.user.id,
      email:     email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      role,
    },
    credentials: {
      email:     email.trim().toLowerCase(),
      password,
      loginUrl:  '/auth/login',
    },
  });
}
