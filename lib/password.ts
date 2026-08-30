// lib/password.ts
// Single source of truth for password policy — shared by signup, reset,
// and any future invite-accept flow, and kept in lockstep with whatever
// Supabase Auth (GoTrue) enforces server-side. Ported from ivents-production's
// utils/password.ts (see execution plan, Batch 2 porting map).

export interface PasswordRule {
  id:    string;
  label: string;
  test:  (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'len',   label: 'At least 8 characters',      test: pw => pw.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: pw => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: pw => /[a-z]/.test(pw) },
  { id: 'num',   label: 'One number (0–9)',           test: pw => /[0-9]/.test(pw) },
];

export function passwordMeetsPolicy(pw: string): boolean {
  return PASSWORD_RULES.every(r => r.test(pw));
}

export function unmetPasswordRules(pw: string): string[] {
  return PASSWORD_RULES.filter(r => !r.test(pw)).map(r => r.label);
}

export function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, label: 'Weak',   color: '#DC2626' };
  if (score <= 4) return { score, label: 'Fair',   color: '#D97706' };
  if (score <= 5) return { score, label: 'Good',   color: '#059669' };
  return               { score, label: 'Strong', color: '#059669' };
}
