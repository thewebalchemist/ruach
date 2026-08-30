// pages/api/health.ts
// Reports which required env vars are missing (by NAME ONLY, never values) and
// whether the database is reachable. Built because a misconfigured environment
// should be loud and immediate, not discovered days later as a silent feature
// failure — see AUDIT_REPORT.md and the ivents-production reference project,
// which hit exactly that failure mode in production.
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const OPTIONAL_ENV = [
  'ZOHO_SMTP_HOST',
  'ZOHO_SMTP_PORT',
  'CONNECT_EMAIL_FROM',
  'CONNECT_EMAIL_PASSWORD',
  'DISCIPLESHIP_EMAIL_FROM',
  'DISCIPLESHIP_EMAIL_PASSWORD',
  'BONGA_CLIENT_ID',
  'BONGA_KEY',
  'BONGA_SECRET',
  'BONGA_SERVICE_ID',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'LIVEKIT_URL',
  'GROQ_API_KEY',
  'NEXT_PUBLIC_R2_PUBLIC_URL',
  'SETUP_SECRET',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const missingRequiredEnv = REQUIRED_ENV.filter(name => !process.env[name]);
  const missingOptionalEnv = OPTIONAL_ENV.filter(name => !process.env[name]);

  let database: { reachable: boolean; error?: string } = { reachable: false };
  try {
    const { error } = await supabaseAdmin.from('profiles').select('id', { head: true, count: 'exact' }).limit(1);
    database = error ? { reachable: false, error: error.message } : { reachable: true };
  } catch (err) {
    database = { reachable: false, error: err instanceof Error ? err.message : 'unknown error' };
  }

  const ok = missingRequiredEnv.length === 0 && database.reachable;

  return res.status(ok ? 200 : 503).json({
    ok,
    timestamp: new Date().toISOString(),
    missingRequiredEnv,
    missingOptionalEnv,
    database,
  });
}
