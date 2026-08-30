-- Found via QA click-through of the member onboarding wizard
-- (pages/member/onboarding.tsx): its final "Complete Setup" step has always
-- hard-failed with a 400 for every real user, because it writes
-- profiles.otp_preference, a column that has never existed. Since a
-- Supabase .update() call is a single statement, the whole profile update
-- (including onboarding_complete: true) was rejected atomically — meaning
-- no member has ever actually been able to complete onboarding through this
-- flow. The UI already has a dedicated "SMS vs Email" OTP-preference step,
-- so this column completes that promise; nothing reads the value yet
-- (grepped — otp_preference is written nowhere else and read nowhere), so
-- wiring actual OTP-channel selection into the login/send-otp routes is a
-- separate follow-up, not required to stop the crash.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS otp_preference text NOT NULL DEFAULT 'sms'
    CHECK (otp_preference IN ('sms', 'email'));
