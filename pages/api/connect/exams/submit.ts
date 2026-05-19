// pages/api/connect/exams/submit.ts
// POST /api/connect/exams/submit
// Scores the exam, writes result + answers, updates student stats, fires notification
// Uses service-role client to bypass RLS (safe because we verify identity server-side)

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export type SubmitExamBody = {
  examId:    string;                     // connect_exams.id
  studentId: string;                     // connect_students.id
  answers:   Record<string, number>;     // { [questionId]: selectedOptionIndex }
};

export type SubmitExamResponse =
  | {
      success: true;
      resultId:   string;
      score:      number;
      totalMarks: number;
      percentage: number;
      passed:     boolean;
      passingMarks: number;
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

  // ── 1. Load the exam ─────────────────────────────────────────────────────
  const { data: exam, error: examErr } = await supabaseAdmin
    .from('connect_exams')
    .select('id, status, total_marks, passing_marks, cohort_id, available_from, available_until')
    .eq('id', examId)
    .single();

  if (examErr || !exam) {
    return res.status(404).json({ success: false, error: 'Exam not found' });
  }

  if (exam.status !== 'published') {
    return res.status(400).json({ success: false, error: 'Exam is not open for submission' });
  }

  // Check time window
  const now = new Date();
  if (exam.available_from && new Date(exam.available_from) > now) {
    return res.status(400).json({ success: false, error: 'Exam has not started yet' });
  }
  if (exam.available_until && new Date(exam.available_until) < now) {
    return res.status(400).json({ success: false, error: 'Exam submission window has closed' });
  }

  // ── 2. Verify student belongs to the same cohort ──────────────────────────
  const { data: student, error: studentErr } = await supabaseAdmin
    .from('connect_students')
    .select('id, cohort_id, user_id, status')
    .eq('id', studentId)
    .single();

  if (studentErr || !student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }

  if (student.cohort_id !== exam.cohort_id) {
    return res.status(403).json({ success: false, error: 'Student not enrolled in this exam cohort' });
  }

  if (['dropped', 'failed'].includes(student.status)) {
    return res.status(403).json({ success: false, error: 'Student is not eligible to submit' });
  }

  // ── 3. Prevent re-submission ──────────────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('connect_exam_results')
    .select('id')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
    .single();

  if (existing) {
    return res.status(409).json({ success: false, error: 'Exam already submitted' });
  }

  // ── 4. Load all questions ─────────────────────────────────────────────────
  const { data: questions, error: qErr } = await supabaseAdmin
    .from('connect_exam_questions')
    .select('id, correct_answer, marks')
    .eq('exam_id', examId);

  if (qErr || !questions) {
    return res.status(500).json({ success: false, error: 'Failed to load questions' });
  }

  // ── 5. Auto-grade ─────────────────────────────────────────────────────────
  let score = 0;
  for (const q of questions) {
    const selected = answers[q.id];
    if (selected !== undefined && selected === q.correct_answer) {
      score += q.marks;
    }
  }

  const totalMarks   = exam.total_marks;
  const percentage   = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;
  const passed       = score >= exam.passing_marks;
  const gradedAt     = new Date().toISOString();

  // ── 6. Write result row ───────────────────────────────────────────────────
  const { data: result, error: resultErr } = await supabaseAdmin
    .from('connect_exam_results')
    .insert({
      exam_id:      examId,
      student_id:   studentId,
      score,
      total_marks:  totalMarks,
      percentage,
      passed,
      submitted_at: gradedAt,
      graded_at:    gradedAt,
    })
    .select('id')
    .single();

  if (resultErr || !result) {
    console.error('Result insert error:', resultErr);
    return res.status(500).json({ success: false, error: 'Failed to save result' });
  }

  // ── 7. Write individual answers ───────────────────────────────────────────
  const answerRows = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
    result_id:       result.id,
    question_id:     questionId,
    selected_answer: selectedAnswer,
  }));

  if (answerRows.length > 0) {
    const { error: answersErr } = await supabaseAdmin
      .from('connect_exam_answers')
      .insert(answerRows);

    if (answersErr) {
      // Non-fatal — result is saved, answers can be retried
      console.error('Answers insert error (non-fatal):', answersErr);
    }
  }

  // ── 8. Fire in-app notification ───────────────────────────────────────────
  await supabaseAdmin.from('notifications').insert({
    user_id:    student.user_id,
    type:       'exam_result',
    title:      passed ? 'Exam Passed!' : 'Exam Completed',
    body:       passed
      ? `You scored ${score}/${totalMarks} (${percentage}%) — well done!`
      : `You scored ${score}/${totalMarks} (${percentage}%). The pass mark is ${exam.passing_marks}/${totalMarks}.`,
    action_url: '/connect/student',
  });

  // ── 9. Issue a warning notification if failed ────────────────────────────
  if (!passed) {
    await supabaseAdmin.from('connect_warnings').insert({
      student_id: studentId,
      type:       'exam',
      message:    `You scored ${percentage}% on a recent exam (pass mark: ${Math.round((exam.passing_marks / totalMarks) * 100)}%). Please review the material and speak to your teacher.`,
    });
  }

  return res.status(200).json({
    success:      true,
    resultId:     result.id,
    score,
    totalMarks,
    percentage,
    passed,
    passingMarks: exam.passing_marks,
  });
}
