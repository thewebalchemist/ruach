// pages/api/auth/send-email-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOtpBodySchema, parseBody, checkRateLimit, getClientIp } from '@/lib/validation';
import { generateOTP, hashOTP, OTP_TTL_MS } from '@/lib/otp';
import { sendLoginCodeEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const parsed = parseBody(sendOtpBodySchema, req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const { email, intent } = parsed.data;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const ip = getClientIp(req);
  if (!checkRateLimit(`send-email-otp:${ip}`, 10, 60_000)) {
    return res.status(429).json({ error: 'Too many requests — try again shortly.' });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from('email_otps')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', oneHourAgo);
  if ((count ?? 0) >= 3) {
    return res.status(429).json({ error: 'Too many codes requested for this address — try again later.' });
  }

  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (intent === 'login' && !owner) {
    return res.status(404).json({ error: 'No account found with this email — sign up first.' });
  }
  if (intent === 'signup' && owner) {
    return res.status(409).json({ error: 'An account with this email already exists — log in instead.' });
  }

  const otp = generateOTP();
  const otpHash = hashOTP(otp, email);

  await supabaseAdmin.from('email_otps').delete().eq('email', email).eq('used', false);

  const { error: insertErr } = await supabaseAdmin.from('email_otps').insert({
    email,
    otp_hash:   otpHash,
    intent,
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });

  if (insertErr) {
    console.error('[send-email-otp] insert error:', insertErr.message);
    return res.status(500).json({ error: 'Failed to send code' });
  }

  try {
    await sendLoginCodeEmail({ to: email, code: otp });
  } catch (err) {
    console.error('[send-email-otp] send failed:', err);
    return res.status(502).json({ error: 'Failed to send email — please try again.' });
  }

  return res.status(200).json({ success: true });
}
