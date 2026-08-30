// lib/exams/submitAndGrade.ts
// Shared grading logic for Connect and Discipleship exam submission —
// these two API routes used to be hand-copied and had already drifted
// (Connect rejected dropped/failed students; Discipleship didn't, so a
// withdrawn student could still permanently lock in a result). One
// implementation now serves both, parameterized by table prefix, so a
// future fix lands in both places at once. See AUDIT_REPORT.md / execution
// plan Batch 4/5.
import { supabaseAdmin } from '@/lib/supabase-admin';
import { awardExamAchievements } from '@/lib/achievements';

export type ExamPrefix = 'connect' | 'discipleship';

export interface SubmitExamParams {
  prefix:    ExamPrefix;
  examId:    string;
  studentId: string;
  answers:   Record<string, number[]>;
  callerId:  string;
  isStaff:   boolean;
}

export type SubmitExamResult =
  | {
      success: true;
      resultId: string; score: number; totalMarks: number; percentage: number;
      passed: boolean; passingMarks: number; achievements: string[];
    }
  | { success: false; status: number; error: string };

export async function submitAndGradeExam(params: SubmitExamParams): Promise<SubmitExamResult> {
  const { prefix, examId, studentId, answers, callerId, isStaff } = params;
  const db = supabaseAdmin as any;

  const examsTable        = `${prefix}_exams`;
  const studentsTable      = `${prefix}_students`;
  const resultsTable       = `${prefix}_exam_results`;
  const questionsTable     = `${prefix}_exam_questions`;
  const answersTable       = `${prefix}_exam_answers`;
  const warningsTable      = `${prefix}_warnings`;
  const studentPortalUrl   = `/${prefix}/student`;

  // 1. Load exam
  const { data: exam, error: examErr } = await db
    .from(examsTable)
    .select('id, status, total_marks, passing_marks, cohort_id, available_from, available_until')
    .eq('id', examId)
    .single();

  if (examErr || !exam) return { success: false, status: 404, error: 'Exam not found' };
  if (exam.status !== 'published') return { success: false, status: 400, error: 'Exam is not open for submission' };

  const now = new Date();
  if (exam.available_from && new Date(exam.available_from) > now)
    return { success: false, status: 400, error: 'Exam has not started yet' };
  if (exam.available_until && new Date(exam.available_until) < now)
    return { success: false, status: 400, error: 'Exam submission window has closed' };

  // 2. Verify student
  const { data: student, error: studentErr } = await db
    .from(studentsTable)
    .select('id, cohort_id, user_id, status')
    .eq('id', studentId)
    .single();

  if (studentErr || !student) return { success: false, status: 404, error: 'Student not found' };
  if (!isStaff && student.user_id !== callerId) return { success: false, status: 403, error: 'Forbidden' };
  if (student.cohort_id !== exam.cohort_id) return { success: false, status: 403, error: 'Student not enrolled in this exam cohort' };
  if (['dropped', 'failed'].includes(student.status)) return { success: false, status: 403, error: 'Student is not eligible to submit' };

  // 3. Prevent re-submission
  const { data: existing } = await db
    .from(resultsTable).select('id').eq('exam_id', examId).eq('student_id', studentId).maybeSingle();
  if (existing) return { success: false, status: 409, error: 'Exam already submitted' };

  // 4. Load questions with correct answers
  const { data: questions, error: qErr } = await db
    .from(questionsTable)
    .select('id, question_type, correct_answers, correct_answer, marks')
    .eq('exam_id', examId);

  if (qErr || !questions) return { success: false, status: 500, error: 'Failed to load questions' };

  // 5. Grade
  let score = 0;
  for (const q of questions) {
    const selected = answers[q.id] ?? [];
    // Canonical correct answers (fall back to old column for legacy questions)
    const correct: number[] = q.correct_answers?.length
      ? q.correct_answers
      : (q.correct_answer != null ? [q.correct_answer] : []);

    if (q.question_type === 'multi') {
      // Exact match required: same elements in any order
      const selSorted = [...selected].sort((a: number, b: number) => a - b).join(',');
      const corSorted = [...correct].sort((a: number, b: number) => a - b).join(',');
      if (selSorted === corSorted && selSorted.length > 0) score += q.marks;
    } else if (selected.length === 1 && selected[0] === correct[0]) {
      score += q.marks;
    }
  }

  const totalMarks = exam.total_marks;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;
  const passed     = score >= exam.passing_marks;
  const gradedAt   = new Date().toISOString();

  // 6. Write result
  const { data: result, error: resultErr } = await db
    .from(resultsTable)
    .insert({ exam_id: examId, student_id: studentId, score, total_marks: totalMarks, percentage, passed, submitted_at: gradedAt, graded_at: gradedAt })
    .select('id')
    .single();

  if (resultErr || !result) {
    console.error(`[${prefix}] exam result insert error:`, resultErr);
    return { success: false, status: 500, error: 'Failed to save result' };
  }

  // 7. Write individual answers (non-fatal to the overall submission, but
  // awaited — a fire-and-forget promise here can get cut off mid-flight
  // once the serverless function returns its response).
  const answerRows = Object.entries(answers).map(([questionId, sel]) => ({
    result_id:        result.id,
    question_id:      questionId,
    selected_answer:  sel[0] ?? -1, // legacy single-value column
    selected_answers: sel,          // new array column
  }));
  if (answerRows.length > 0) {
    const { error: answersErr } = await db.from(answersTable).insert(answerRows);
    if (answersErr) console.error(`[${prefix}] answers insert (non-fatal):`, answersErr.message);
  }

  // 8. Notification + warning-on-fail
  await db.from('notifications').insert({
    user_id:    student.user_id,
    type:       'exam_result',
    title:      passed ? 'Exam Passed!' : 'Exam Completed',
    body:       passed
      ? `You scored ${score}/${totalMarks} (${percentage}%) — well done!`
      : `You scored ${score}/${totalMarks} (${percentage}%). Pass mark: ${exam.passing_marks}/${totalMarks}.`,
    action_url: studentPortalUrl,
  });

  if (!passed) {
    await db.from(warningsTable).insert({
      student_id: studentId,
      type:       'exam',
      message:    `You scored ${percentage}% (pass mark: ${Math.round((exam.passing_marks / totalMarks) * 100)}%). Please review the material and speak to your teacher.`,
    });
  }

  // 9. Check first-ever exam submission across all exams
  const { count: prevCount } = await db
    .from(resultsTable)
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId);

  const isFirst = (prevCount ?? 0) === 1;

  // 10. Award achievements
  const earned = await awardExamAchievements(student.user_id, percentage, isFirst);

  return {
    success: true,
    resultId: result.id,
    score, totalMarks, percentage, passed,
    passingMarks: exam.passing_marks,
    achievements: earned.map((a: any) => a.slug),
  };
}
