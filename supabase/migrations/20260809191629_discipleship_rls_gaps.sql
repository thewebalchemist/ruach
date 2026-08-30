-- ============================================================
-- Remaining Discipleship RLS gaps (Batch 5). Several were already fixed
-- alongside their Connect twin in earlier migrations (exams, exam_questions,
-- attendance, warnings, legacy_requests); this closes the rest:
--   - discipleship_students: allow scoped self-enrollment (was staff-only,
--     so the one page whose entire purpose is member self-enrollment could
--     never succeed for its target audience)
--   - discipleship_exam_answers: no policy at all
--   - discipleship_resources: no policy at all
--   - discipleship_sessions: no write policy at all (staff couldn't create
--     sessions for a cohort)
-- ============================================================

CREATE POLICY discipleship_students_self_insert ON discipleship_students FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY discipleship_exam_answers_insert ON discipleship_exam_answers FOR INSERT
  WITH CHECK (
    result_id IN (
      SELECT r.id FROM discipleship_exam_results r
      JOIN discipleship_students s ON s.id = r.student_id
      WHERE s.user_id = auth.uid()
    )
  );

CREATE POLICY discipleship_exam_answers_select ON discipleship_exam_answers FOR SELECT
  USING (
    result_id IN (
      SELECT r.id FROM discipleship_exam_results r
      JOIN discipleship_students s ON s.id = r.student_id
      WHERE s.user_id = auth.uid()
    )
    OR is_staff()
  );

CREATE POLICY discipleship_resources_select ON discipleship_resources FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY discipleship_resources_write ON discipleship_resources FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY discipleship_sessions_write ON discipleship_sessions FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());
