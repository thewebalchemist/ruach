// lib/phone.ts
// Single source of truth for Kenyan phone number handling. Ported from
// ivents-production's utils/phone.ts (see AUDIT_REPORT.md / execution plan,
// Batch 2 porting map) — consolidates what used to be three separate,
// slightly-inconsistent normalizers (lib/sms.ts, lib/auth-utils.ts, and
// ad hoc inline regexes).

/** Strips non-digits and normalises to 254XXXXXXXXX (no leading +). */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

/** Formats a normalized phone for display: +254 7XX XXX XXX */
export function formatPhoneDisplay(normalized: string): string {
  if (normalized.length === 12 && normalized.startsWith('254')) {
    return `+${normalized.slice(0, 3)} ${normalized.slice(3, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 10)} ${normalized.slice(10)}`;
  }
  return `+${normalized}`;
}

/** True if a normalized phone is a well-formed Kenyan mobile number. */
export function isValidKenyanPhone(normalized: string): boolean {
  return /^254[17]\d{8}$/.test(normalized);
}

/**
 * The canonical stored format for `profiles.phone` (E.164, e.g. +254712345678).
 * Internal OTP/SMS-gateway code uses the digits-only `normalizePhone()` output
 * instead — only convert to E.164 at the point of writing to/querying `profiles`.
 */
export function toE164(normalized: string): string {
  return `+${normalized}`;
}

/** Returns true if the string looks like a phone number rather than an email. */
export function isLikelyPhone(value: string): boolean {
  if (value.includes('@')) return false;
  const stripped = value.replace(/[\s\-()]/g, '');
  return /^(\+|0\d|254|\d{9,})/.test(stripped);
}
