-- ============================================================
-- connect_warnings and discipleship_warnings both had RLS enabled with
-- zero policies (deny-all) — staff could never send a warning through the
-- normal client, and a student could never see one sent to them.
-- ============================================================

CREATE POLICY connect_warnings_select ON connect_warnings FOR SELECT
  USING (
    student_id IN (SELECT id FROM connect_students WHERE user_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY connect_warnings_insert ON connect_warnings FOR INSERT
  WITH CHECK (is_staff());

CREATE POLICY discipleship_warnings_select ON discipleship_warnings FOR SELECT
  USING (
    student_id IN (SELECT id FROM discipleship_students WHERE user_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY discipleship_warnings_insert ON discipleship_warnings FOR INSERT
  WITH CHECK (is_staff());
