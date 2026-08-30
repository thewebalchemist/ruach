-- Completes an earlier incomplete migration: correct_answers int[] and
-- question_type were added to {connect,discipleship}_exam_questions to
-- support multi-select questions, but the matching selected_answers array
-- was never added to {connect,discipleship}_exam_answers. Every exam
-- submission has been writing a selected_answers value that doesn't exist
-- on the table — a silent, swallowed 42703 error on every real exam
-- submission (lib/exams/submitAndGrade.ts step 7), so no per-question
-- answer breakdown has ever actually been recorded.
ALTER TABLE connect_exam_answers
  ADD COLUMN IF NOT EXISTS selected_answers int[] NOT NULL DEFAULT '{}';
ALTER TABLE discipleship_exam_answers
  ADD COLUMN IF NOT EXISTS selected_answers int[] NOT NULL DEFAULT '{}';

UPDATE connect_exam_answers
  SET selected_answers = ARRAY[selected_answer]
  WHERE array_length(selected_answers, 1) IS NULL AND selected_answer IS NOT NULL AND selected_answer >= 0;
UPDATE discipleship_exam_answers
  SET selected_answers = ARRAY[selected_answer]
  WHERE array_length(selected_answers, 1) IS NULL AND selected_answer IS NOT NULL AND selected_answer >= 0;
