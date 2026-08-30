// lib/phone-auth.ts
// Supabase Auth requires an email identity even for phone-only accounts.
// For a user who verifies via phone OTP and never supplies a real email,
// we synthesize one so `admin.createUser`/`admin.generateLink` have
// something to attach the account to. Ported from ivents-production's
// lib/phone-auth.ts (virtualPassword is intentionally not carried over —
// ivents itself marks it dead/legacy, superseded by the magic-link session
// flow in lib/invite-session.ts).

const VIRTUAL_EMAIL_DOMAIN = 'phone.ruachtabernacle.org';

/** A normalized phone (e.g. 254712345678) → a synthetic, stable auth email. */
export function virtualEmail(normalizedPhone: string): string {
  return `${normalizedPhone}@${VIRTUAL_EMAIL_DOMAIN}`;
}

export function isVirtualEmail(email: string): boolean {
  return email.endsWith(`@${VIRTUAL_EMAIL_DOMAIN}`);
}
