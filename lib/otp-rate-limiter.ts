// lib/otp-rate-limiter.ts
// Per-identity OTP *verify-attempt* limiter — distinct from the send-side
// limiter (which is DB-backed via a row-count query in send-*-otp.ts, so it
// survives process restarts). This one is in-memory, which is fine for a
// single-process deploy; see AUDIT_REPORT.md / execution plan note about
// revisiting if the deploy topology ever becomes multi-instance.
// Ported from ivents-production's lib/otp-rate-limiter.ts.

const WINDOW_MS  = 15 * 60_000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkOtpRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = attempts.get(key);
  if (!bucket || bucket.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_ATTEMPTS) return false;
  bucket.count++;
  return true;
}

export function clearOtpRateLimit(key: string): void {
  attempts.delete(key);
}
