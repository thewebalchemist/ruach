// lib/invite-session.ts
// Mints a passwordless session for a user who just proved ownership of a
// phone or email via OTP. Ported from ivents-production's lib/invite-session.ts,
// with one deliberate change: callers already know (via a `profiles` lookup)
// whether the identity is new or existing, so this doesn't re-derive that by
// scanning `admin.listUsers()` — a fragile, unpaginated approach in the
// original.
//
// Why a magic-link token_hash instead of a phone-derived deterministic
// password: a deterministic password breaks the moment the user later sets
// their own real password (ivents hit this in production before switching
// to this approach — see execution plan Appendix B).
import { supabaseAdmin } from '@/lib/supabase-admin';

interface InviteSessionResult {
  tokenHash: string;
  userId:    string;
}

interface NewUserMetadata {
  first_name?: string;
  last_name?:  string;
  role?:       string;
  [key: string]: unknown;
}

/** For an identity confirmed NOT to exist yet: creates the auth user (the
 * `handle_new_user` DB trigger creates the matching `profiles` row), then
 * mints a magic-link token_hash. */
export async function createInviteSession(
  email: string,
  phone: string | null = null,
  metadata: NewUserMetadata = {},
): Promise<InviteSessionResult> {
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    phone: phone ?? undefined,
    email_confirm: true,
    phone_confirm: !!phone,
    user_metadata: metadata,
  });

  if (createErr || !created?.user) throw createErr ?? new Error('Failed to create user');

  return mintSessionForEmail(email, created.user.id);
}

/** For an identity confirmed to already belong to `userId`: mints a
 * magic-link token_hash without touching the existing account. */
export async function mintSessionForEmail(email: string, userId: string): Promise<InviteSessionResult> {
  const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (linkErr || !link?.properties?.hashed_token) {
    throw linkErr ?? new Error('Failed to generate session token');
  }

  return { tokenHash: link.properties.hashed_token, userId };
}
