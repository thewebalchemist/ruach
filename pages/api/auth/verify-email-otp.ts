// pages/api/auth/verify-email-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyOtpBodySchema, parseBody } from '@/lib/validation';
import { hashOTP } from '@/lib/otp';
import { checkOtpRateLimit, clearOtpRateLimit } from '@/lib/otp-rate-limiter';
import { createInviteSession, mintSessionForEmail } from '@/lib/invite-session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const parsed = parseBody(verifyOtpBodySchema, req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const { email, code } = parsed.data;
  if (!email) return res.status(400).json({ error: 'email is required' });

  if (!checkOtpRateLimit(`email-otp:${email}`)) {
    return res.status(429).json({ error: 'Too many attempts — request a new code shortly.' });
  }

  const otpHash = hashOTP(code, email);

  const { data: record } = await supabaseAdmin
    .from('email_otps')
    .select('id, intent')
    .eq('email', email)
    .eq('otp_hash', otpHash)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }

  await supabaseAdmin.from('email_otps').update({ used: true }).eq('id', record.id);
  clearOtpRateLimit(`email-otp:${email}`);

  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  try {
    const session = owner
      ? await mintSessionForEmail(owner.email, owner.id)
      : await createInviteSession(email, null, { role: 'student' });

    return res.status(200).json({
      success:   true,
      tokenHash: session.tokenHash,
      userId:    session.userId,
      isNewUser: !owner,
    });
  } catch (err) {
    console.error('[verify-email-otp] session mint failed:', err);
    return res.status(500).json({ error: 'Failed to establish session' });
  }
}
