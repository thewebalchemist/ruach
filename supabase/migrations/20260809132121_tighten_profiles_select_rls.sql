-- ============================================================
-- P0 security fix (see AUDIT_REPORT.md, finding #4):
--
-- profiles_select previously allowed ANY authenticated user, of ANY
-- role — including a freshly self-registered 'student' — to read
-- every member's full profile (email, phone, address, DOB, marital
-- status). Restrict SELECT to a user's own row, plus staff who
-- legitimately need the directory for their work.
-- ============================================================

DROP POLICY IF EXISTS profiles_select ON profiles;

CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (id = auth.uid() OR is_staff());
