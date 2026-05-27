// lib/auth-utils.ts
// Shared auth helpers used by both login pages.

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
