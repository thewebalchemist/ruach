// pages/api/auth/forgot-password.ts
// Single contact field (phone or email), anti-enumeration (always returns
// success), sends the reset link via email always and additionally via SMS
// if the account has a phone on file. Ported from ivents-production's
// forgot-password.ts (see execution plan Appendix B).
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIp } from '@/lib/validation';
import { isLikelyPhone, normalizePhone, toE164 } from '@/lib/phone';
import { sendPasswordReset } from '@/lib/email';
import { sendSMS } from '@/lib/sms';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const ip = getClientIp(req);
  if (!checkRateLimit(`forgot-password:${ip}`, 5, 5 * 60_000)) {
    // Still don't reveal anything — just slow down.
    return res.status(200).json({ success: true });
  }

  const { contact } = req.body as { contact?: string };
  if (!contact || typeof contact !== 'string') {
    return res.status(200).json({ success: true });
  }

  // Never reveal whether an identity is registered — resolve and send
  // best-effort, but always respond the same way either way.
  let profile: { id: string; email: string; first_name: string; phone: string | null } | null = null;

  if (isLikelyPhone(contact)) {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, phone')
      .eq('phone', toE164(normalizePhone(contact)))
      .maybeSingle();
    profile = data;
  } else {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, phone')
      .eq('email', contact.trim().toLowerCase())
      .maybeSingle();
    profile = data;
  }

  if (profile) {
    try {
      const { data: link } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: profile.email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password` },
      });

      if (link?.properties?.action_link) {
        await sendPasswordReset({
          to: profile.email,
          firstName: profile.first_name || 'there',
          resetUrl: link.properties.action_link,
        });

        if (profile.phone) {
          await sendSMS(
            normalizePhone(profile.phone),
            `RuachConnect: Reset your password here: ${link.properties.action_link}`,
          );
        }
      }
    } catch (err) {
      // Swallow — the response must not vary based on success/failure here.
      console.error('[forgot-password] send failed:', err);
    }
  }

  return res.status(200).json({ success: true });
}
