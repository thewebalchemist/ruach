-- ============================================================
-- connect_attendance and discipleship_attendance both had RLS enabled with
-- zero policies — a student couldn't see their own attendance and staff
-- couldn't mark it through the normal client (only through the
-- service-role-backed /api/classroom/attendance route, which is a separate
-- auto-attendance path for live sessions, not manual/CSV-import marking).
-- ============================================================

CREATE POLICY connect_attendance_select ON connect_attendance FOR SELECT
  USING (
    student_id IN (SELECT id FROM connect_students WHERE user_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY connect_attendance_write ON connect_attendance FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY discipleship_attendance_select ON discipleship_attendance FOR SELECT
  USING (
    student_id IN (SELECT id FROM discipleship_students WHERE user_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY discipleship_attendance_write ON discipleship_attendance FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());
