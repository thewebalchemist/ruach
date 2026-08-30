// lib/auth-utils.ts
// Shared auth helpers used by both login pages.

/**
 * Converts raw Supabase auth error messages into human-readable strings.
 * Never exposes internal Supabase details to the user.
 */
export function friendlyAuthError(message: string | undefined, context: 'email' | 'otp' = 'email'): string {
  if (!message) return 'Sign in failed. Please try again.';
  const m = message.toLowerCase();

  if (m.includes('invalid login credentials') || m.includes('invalid credentials') || m.includes('invalid grant'))
    return 'Incorrect email or password.';

  if (m.includes('email not confirmed'))
    return 'Your email has not been confirmed. Check your inbox for a confirmation link.';

  if (m.includes('too many requests') || m.includes('rate limit') || m.includes('over_email_send_rate_limit') || m.includes('over_sms'))
    return 'Too many attempts. Please wait a few minutes before trying again.';

  if (m.includes('database error') || m.includes('querying schema') || m.includes('internal server') || m.includes('unexpected failure'))
    return 'A server error occurred. If this is your first sign-in, the account may not have been created yet. Contact your administrator.';

  if (m.includes('user not found') || m.includes('no user'))
    return 'No account found with these details. Contact your administrator.';

  if (m.includes('network') || m.includes('failed to fetch') || m.includes('fetch error'))
    return 'Connection error. Check your internet connection and try again.';

  if (m.includes('token') && m.includes('expired'))
    return 'This link has expired. Please request a new one.';

  if (context === 'otp' && (m.includes('token') || m.includes('invalid') || m.includes('expired') || m.includes('otp')))
    return 'Invalid or expired code. Please request a new OTP.';

  if (m.includes('phone') || m.includes('sms'))
    return 'Unable to send SMS. Make sure the phone number is correct and try again.';

  // Fallback — don't leak internal Supabase messages
  return 'Sign in failed. Please try again.';
}

export function formatKenyanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')   && digits.length === 10) return '+254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return '+' + digits;
  if (digits.startsWith('7')   && digits.length === 9)  return '+254' + digits;
  return raw;
}

export function isValidKenyanPhone(phone: string): boolean {
  return /^\+254[17]\d{8}$/.test(phone);
}
