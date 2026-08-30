// lib/validation.ts
// Centralized Zod schemas + transport-layer utilities, consumed by both
// client-side forms and API route body parsing so validation can never
// drift between the two the way it did in the ivents-production reference
// (three slightly different email regexes across three files — see
// AUDIT_REPORT.md / execution plan, Batch 2).
import { z } from 'zod';
import { normalizePhone, isValidKenyanPhone } from '@/lib/phone';
import { passwordMeetsPolicy, unmetPasswordRules } from '@/lib/password';

// ── Core field schemas ───────────────────────────────────────────────────────

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .transform(normalizePhone)
  .refine(isValidKenyanPhone, 'Enter a valid Kenyan phone number');

export const passwordSchema = z
  .string()
  .superRefine((pw, ctx) => {
    if (!passwordMeetsPolicy(pw)) {
      ctx.addIssue({ code: 'custom', message: unmetPasswordRules(pw)[0] ?? 'Password does not meet requirements' });
    }
  });

export const nameSchema = z.string().trim().min(1, 'Required').max(100, 'Too long');

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

export const uuidSchema = z.string().uuid('Invalid ID');

export const amountSchema = z.coerce.number().min(0).max(1_000_000_000);

// ── Composite schemas used by the auth flow (Batch 2) ─────────────────────────

export const contactSchema = z.union([emailSchema, phoneSchema]);

export const sendOtpBodySchema = z
  .object({
    email:  emailSchema.optional(),
    phone:  phoneSchema.optional(),
    intent: z.enum(['login', 'signup']),
  })
  .refine(b => !!b.email || !!b.phone, { message: 'email or phone is required' });

export const verifyOtpBodySchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    code:  z.string().trim().length(6, 'Enter the 6-digit code'),
  })
  .refine(b => !!b.email || !!b.phone, { message: 'email or phone is required' });

export const signupBodySchema = z.object({
  firstName: nameSchema,
  lastName:  nameSchema,
  email:     emailSchema.optional(),
  phone:     phoneSchema.optional(),
  password:  passwordSchema.optional(),
}).refine(b => !!b.email || !!b.phone, { message: 'email or phone is required' });

// ── Parsing helper ────────────────────────────────────────────────────────────

/** Parse `req.body` against a schema; returns a typed result or a 400-ready error string. */
export function parseBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.issues[0]?.message ?? 'Invalid request' };
}

// ── Transport-layer utilities (not format validation — orthogonal to Zod) ─────
// Ported from ivents-production's lib/validation.ts.

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return stripHtml(input).slice(0, 10_000);
}

export function sanitizeName(input: unknown): string {
  if (typeof input !== 'string') return '';
  return stripHtml(input).slice(0, 500);
}

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Escapes a value used inside a PostgREST `.or()`/`.filter()` string to prevent filter injection. */
export function sanitizeFilterValue(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[,()"]/g, '').trim();
}

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

/** In-memory, single-process rate limiter. Fine for a low-traffic church app on
 * one Node process; if the deploy topology ever becomes multi-instance, this
 * needs to move to a DB-backed counter (flagged in the execution plan). */
export function checkRateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count++;
  return true;
}

/** Best-effort client IP, preferring trusted proxy headers when configured. */
export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp) return cfIp;

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ips = list.split(',').map(s => s.trim()).filter(Boolean);
    const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? '1');
    // Take the IP `hops` entries from the end — the entry nearest our own proxy,
    // not the client-supplied first entry (which is trivially spoofable).
    if (ips.length >= hops) return ips[ips.length - hops];
    if (ips.length > 0) return ips[0];
  }

  return req.socket?.remoteAddress ?? 'unknown';
}
