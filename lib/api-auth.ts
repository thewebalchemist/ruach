import type { NextApiRequest } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_ROLES = ['admin', 'pastor'];

export interface CallerProfile {
  id: string;
  role: string;
  status: string;
}

export async function getCallerProfile(
  req: NextApiRequest,
  allowedRoles: string[] = DEFAULT_ROLES,
): Promise<CallerProfile | null> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, status')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role) || profile.status === 'suspended') return null;

  return profile as CallerProfile;
}

export { supabaseAdmin };
