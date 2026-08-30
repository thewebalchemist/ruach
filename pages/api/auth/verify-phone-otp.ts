// pages/api/auth/verify-phone-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyOtpBodySchema, parseBody } from '@/lib/validation';
import { toE164 } from '@/lib/phone';
import { hashOTP } from '@/lib/otp';
import { checkOtpRateLimit, clearOtpRateLimit } from '@/lib/otp-rate-limiter';
import { createInviteSession, mintSessionForEmail } from '@/lib/invite-session';
import { virtualEmail } from '@/lib/phone-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const parsed = parseBody(verifyOtpBodySchema, req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const { phone, code } = parsed.data;
  if (!phone) return res.status(400).json({ error: 'phone is required' });

  if (!checkOtpRateLimit(`phone-otp:${phone}`)) {
    return res.status(429).json({ error: 'Too many attempts — request a new code shortly.' });
  }

  const otpHash = hashOTP(code, phone);

  const { data: record } = await supabaseAdmin
    .from('phone_otps')
    .select('id, intent')
    .eq('phone', phone)
    .eq('otp_hash', otpHash)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }

  await supabaseAdmin.from('phone_otps').update({ used: true }).eq('id', record.id);
  clearOtpRateLimit(`phone-otp:${phone}`);

  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('phone', toE164(phone))
    .maybeSingle();

  try {
    const session = owner
      ? await mintSessionForEmail(owner.email, owner.id)
      : await createInviteSession(virtualEmail(phone), toE164(phone), { role: 'student' });

    return res.status(200).json({
      success:   true,
      tokenHash: session.tokenHash,
      userId:    session.userId,
      isNewUser: !owner,
    });
  } catch (err) {
    console.error('[verify-phone-otp] session mint failed:', err);
    return res.status(500).json({ error: 'Failed to establish session' });
  }
}
