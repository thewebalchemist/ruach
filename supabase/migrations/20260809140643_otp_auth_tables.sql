-- ============================================================
-- OTP auth tables (Batch 2 — see execution plan Appendix B).
-- Custom OTP system ported from ivents-production: codes are hashed
-- before storage, never stored or logged in plaintext. Only the
-- service-role client touches these tables (RLS enabled, no policies).
-- ============================================================

-- uuid-ossp installs into the `extensions` schema on Supabase; this
-- connection's search_path doesn't include it by default.
SET search_path TO public, extensions;

CREATE TABLE IF NOT EXISTS phone_otps (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      text        NOT NULL,
  otp_hash   text        NOT NULL,
  intent     text        NOT NULL CHECK (intent IN ('login', 'signup')),
  expires_at timestamptz NOT NULL,
  used       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS phone_otps_lookup_idx ON phone_otps (phone, used);

CREATE TABLE IF NOT EXISTS email_otps (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      text        NOT NULL,
  otp_hash   text        NOT NULL,
  intent     text        NOT NULL CHECK (intent IN ('login', 'signup')),
  expires_at timestamptz NOT NULL,
  used       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_otps_lookup_idx ON email_otps (email, used);

ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;
-- No policies defined on purpose: only the service-role client (which
-- bypasses RLS) ever reads or writes these tables, from pages/api/auth/*.

-- The OTP ownership-check logic (send-phone-otp.ts: "does this phone
-- already belong to an account?") is only meaningful if phone numbers
-- are actually unique per account. NOTE: this may fail against the
-- existing production data set if any two profiles already share a
-- phone value — verify against staging before promoting to prod, and
-- resolve any duplicates first if it does.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique ON profiles (phone) WHERE phone IS NOT NULL;
