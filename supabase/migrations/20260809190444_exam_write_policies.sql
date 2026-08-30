-- ============================================================
-- connect_exams, connect_exam_questions, discipleship_exams, and
-- discipleship_exam_questions all had only a student-facing SELECT policy
-- ('published' OR is_staff()) — no INSERT/UPDATE policy at all. This
-- silently broke exam creation for every role, including staff, despite
-- pages/connect/exams/new.tsx (and its discipleship equivalent) already
-- writing correct client-side insert code: RLS denied it either way.
-- Not caught by the original audit since it required tracing the exact
-- policy set, not just confirming a real Supabase call was made.
-- ============================================================

CREATE POLICY connect_exams_write ON connect_exams FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY connect_exam_questions_write ON connect_exam_questions FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY discipleship_exams_write ON discipleship_exams FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY discipleship_exam_questions_write ON discipleship_exam_questions FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());
