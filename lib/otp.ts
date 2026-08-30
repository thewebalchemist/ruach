// lib/otp.ts
// OTP generation/hashing shared by both the phone and email OTP flows.
// Codes are never stored or logged in plaintext — only their hash.
//
// SECURITY: unlike ivents-production (which falls back to a hardcoded
// public string if PHONE_AUTH_SECRET is unset — see AUDIT_REPORT.md /
// execution plan, "do not port" list), this fails closed: a missing
// secret throws immediately rather than silently hashing with a
// guessable default.
import { randomInt, createHash } from 'crypto';

const secret = process.env.PHONE_AUTH_SECRET;
if (!secret) {
  throw new Error(
    'PHONE_AUTH_SECRET must be set — refusing to start OTP auth with no secret configured.',
  );
}

export function generateOTP(): string {
  return randomInt(100_000, 1_000_000).toString();
}

export function hashOTP(otp: string, identity: string): string {
  return createHash('sha256').update(`${identity}:${otp}:${secret}`).digest('hex');
}

export const OTP_TTL_MS = 10 * 60_000; // 10 minutes
