-- Found via live click-through: signed in as a real, enrolled Discipleship
-- student (grace.njeri), published a real exam as a teacher, then tried to
-- take it. The exam loaded (title, marks, timer all correct) but showed
-- "0/0 answered" — the question list was silently empty. No client error,
-- because PostgREST doesn't error on a blocked nested embed, it just
-- returns an empty array for the relation the caller can't read.
--
-- Root cause: discipleship_exam_questions has only one RLS policy —
-- discipleship_exam_questions_write (is_staff()), added in
-- 20260809190444_exam_write_policies.sql. That migration's own comment
-- claims a student-facing SELECT policy already existed for this table,
-- but it never did (confirmed by grepping every migration) — only the
-- sibling connect_exam_questions ever got one
-- (connect_exam_questions_student, baseline.sql). Every Discipleship
-- student has been unable to see a single question on any exam, ever.
-- Mirrors connect_exam_questions_student exactly.
CREATE POLICY discipleship_exam_questions_student ON discipleship_exam_questions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM discipleship_exams e WHERE e.id = exam_id AND (e.status = 'published' OR is_staff()))
  );
