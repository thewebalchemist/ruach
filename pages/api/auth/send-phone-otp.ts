// pages/api/auth/send-phone-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOtpBodySchema, parseBody, checkRateLimit, getClientIp } from '@/lib/validation';
import { normalizePhone, toE164 } from '@/lib/phone';
import { generateOTP, hashOTP, OTP_TTL_MS } from '@/lib/otp';
import { sendSMS } from '@/lib/sms';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const parsed = parseBody(sendOtpBodySchema, req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const { phone, intent } = parsed.data;
  if (!phone) return res.status(400).json({ error: 'phone is required' });

  const ip = getClientIp(req);
  if (!checkRateLimit(`send-phone-otp:${ip}`, 10, 60_000)) {
    return res.status(429).json({ error: 'Too many requests — try again shortly.' });
  }

  // DB-backed per-identity limiter (survives restarts): max 3 sends / 60 min.
  const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from('phone_otps')
    .select('id', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', oneHourAgo);
  if ((count ?? 0) >= 3) {
    return res.status(429).json({ error: 'Too many codes requested for this number — try again later.' });
  }

  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('phone', toE164(phone))
    .maybeSingle();

  if (intent === 'login' && !owner) {
    return res.status(404).json({ error: 'No account found with this phone number — sign up first.' });
  }
  if (intent === 'signup' && owner) {
    return res.status(409).json({ error: 'An account with this phone number already exists — log in instead.' });
  }

  const otp = generateOTP();
  const otpHash = hashOTP(otp, phone);

  await supabaseAdmin.from('phone_otps').delete().eq('phone', phone).eq('used', false);

  const { error: insertErr } = await supabaseAdmin.from('phone_otps').insert({
    phone,
    otp_hash:   otpHash,
    intent,
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  });

  if (insertErr) {
    console.error('[send-phone-otp] insert error:', insertErr.message);
    return res.status(500).json({ error: 'Failed to send code' });
  }

  const result = await sendSMS(normalizePhone(phone), `Your RuachConnect verification code is ${otp}. It expires in 10 minutes.`);
  if (result.status !== 222) {
    return res.status(502).json({ error: 'Failed to send SMS — please try again.' });
  }

  return res.status(200).json({ success: true });
}
