import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardExamAchievements } from '@/lib/achievements';

export type SubmitExamBody = {
  examId:    string;
  studentId: string;
  answers:   Record<string, number[]>;
};

export type SubmitExamResponse =
  | {
      success:      true;
      resultId:     string;
      score:        number;
      totalMarks:   number;
      percentage:   number;
      passed:       boolean;
      passingMarks: number;
      achievements: string[];
    }
  | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitExamResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { examId, studentId, answers } = req.body as SubmitExamBody;

  if (!examId || !studentId || !answers) {
    return res.status(400).json({ success: false, error: 'Missing examId, studentId, or answers' });
  }

  // ── 1. Load exam ──────────────────────────────────────────────────────────
  const { data: exam, error: examErr } = await supabaseAdmin
    .from('connect_exams')
    .select('id, status, total_marks, passing_marks, cohort_id, available_from, available_until')
    .eq('id', examId)
    .single();

  if (examErr || !exam) return res.status(404).json({ success: false, error: 'Exam not found' });
  if (exam.status !== 'published') return res.status(400).json({ success: false, error: 'Exam is not open for submission' });

  const now = new Date();
  if (exam.available_from && new Date(exam.available_from) > now)
    return res.status(400).json({ success: false, error: 'Exam has not started yet' });
  if (exam.available_until && new Date(exam.available_until) < now)
    return res.status(400).json({ success: false, error: 'Exam submission window has closed' });

  // ── 2. Verify student ─────────────────────────────────────────────────────
  const { data: student, error: studentErr } = await supabaseAdmin
    .from('connect_students')
    .select('id, cohort_id, user_id, status')
    .eq('id', studentId)
    .single();

  if (studentErr || !student) return res.status(404).json({ success: false, error: 'Student not found' });
  if (student.cohort_id !== exam.cohort_id) return res.status(403).json({ success: false, error: 'Student not enrolled in this exam cohort' });
  if (['dropped', 'failed'].includes(student.status)) return res.status(403).json({ success: false, error: 'Student is not eligible to submit' });

  // ── 3. Prevent re-submission ──────────────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('connect_exam_results').select('id').eq('exam_id', examId).eq('student_id', studentId).maybeSingle();

  if (existing) return res.status(409).json({ success: false, error: 'Exam already submitted' });

  // ── 4. Load questions with correct_answers ────────────────────────────────
  const { data: questions, error: qErr } = await supabaseAdmin
    .from('connect_exam_questions')
    .select('id, question_type, correct_answers, correct_answer, marks')
    .eq('exam_id', examId);

  if (qErr || !questions) return res.status(500).json({ success: false, error: 'Failed to load questions' });

  // ── 5. Grade ──────────────────────────────────────────────────────────────
  let score = 0;
  for (const q of questions) {
    const selected = answers[q.id] ?? [];
    // Canonical correct answers (fall back to old column for legacy questions)
    const correct: number[] = q.correct_answers?.length
      ? q.correct_answers
      : (q.correct_answer != null ? [q.correct_answer] : []);

    const isMulti = q.question_type === 'multi';
    if (isMulti) {
      // Exact match required: same elements in any order
      const selSorted = [...selected].sort((a, b) => a - b).join(',');
      const corSorted = [...correct].sort((a, b) => a - b).join(',');
      if (selSorted === corSorted && selSorted.length > 0) score += q.marks;
    } else {
      if (selected.length === 1 && selected[0] === correct[0]) score += q.marks;
    }
  }

  const totalMarks = exam.total_marks;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;
  const passed     = score >= exam.passing_marks;
  const gradedAt   = new Date().toISOString();

  // ── 6. Write result ───────────────────────────────────────────────────────
  const { data: result, error: resultErr } = await supabaseAdmin
    .from('connect_exam_results')
    .insert({ exam_id: examId, student_id: studentId, score, total_marks: totalMarks, percentage, passed, submitted_at: gradedAt, graded_at: gradedAt })
    .select('id')
    .single();

  if (resultErr || !result) {
    console.error('Result insert error:', resultErr);
    return res.status(500).json({ success: false, error: 'Failed to save result' });
  }

  // ── 7. Write individual answers (non-fatal) ───────────────────────────────
  const answerRows = Object.entries(answers).map(([questionId, sel]) => ({
    result_id:       result.id,
    question_id:     questionId,
    selected_answer: sel[0] ?? -1,          // legacy single-value column
    selected_answers: sel,                   // new array column (if it exists)
  }));
  if (answerRows.length > 0) {
    await supabaseAdmin.from('connect_exam_answers').insert(answerRows).then(({ error }) => {
      if (error) console.error('Answers insert (non-fatal):', error.message);
    });
  }

  // ── 8. Notification ───────────────────────────────────────────────────────
  await supabaseAdmin.from('notifications').insert({
    user_id:    student.user_id,
    type:       'exam_result',
    title:      passed ? 'Exam Passed!' : 'Exam Completed',
    body:       passed
      ? `You scored ${score}/${totalMarks} (${percentage}%) — well done!`
      : `You scored ${score}/${totalMarks} (${percentage}%). Pass mark: ${exam.passing_marks}/${totalMarks}.`,
    action_url: '/connect/student',
  });

  if (!passed) {
    await supabaseAdmin.from('connect_warnings').insert({
      student_id: studentId,
      type:       'exam',
      message:    `You scored ${percentage}% (pass mark: ${Math.round((exam.passing_marks / totalMarks) * 100)}%). Please review the material and speak to your teacher.`,
    });
  }

  // ── 9. Check first-ever exam submission across all exams ──────────────────
  const { count: prevCount } = await supabaseAdmin
    .from('connect_exam_results')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId);

  const isFirst = (prevCount ?? 0) === 1; // this submission is the first

  // ── 10. Award achievements ────────────────────────────────────────────────
  const earned = await awardExamAchievements(student.user_id, percentage, isFirst);

  return res.status(200).json({
    success:      true,
    resultId:     result.id,
    score,
    totalMarks,
    percentage,
    passed,
    passingMarks: exam.passing_marks,
    achievements: earned.map(a => a.slug),
  });
}
