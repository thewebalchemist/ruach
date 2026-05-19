// pages/connect/student/exams/[examId].tsx
// Student exam page — works in demo mode (instant mock scoring) or live mode (API)
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Clock, CheckCircle, AlertTriangle,
  Send, ChevronLeft, ChevronRight, Loader2, WifiOff
} from 'lucide-react';
import { mockConnectExams } from '@/data/connect';
import { useMode } from '@/context/ModeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { SubmitExamBody, SubmitExamResponse } from '@/pages/api/connect/exams/submit';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LiveQuestion {
  id: string;
  question_number: number;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options: string[];
  correct_answer: number;
  marks: number;
}

interface LiveExam {
  id: string;
  title: string;
  total_marks: number;
  passing_marks: number;
  duration_minutes: number;
  status: string;
  available_from: string | null;
  available_until: string | null;
  questions: LiveQuestion[];
}

interface ScoreResult {
  score: number;
  total: number;
  pct: number;
  passed: boolean;
  passingMarks: number;
}

export default function StudentExamPage() {
  const router          = useRouter();
  const { examId }      = router.query as { examId: string };
  const { isDemoMode }  = useMode();
  const { profile }     = useAuth();

  // ── Loading state ─────────────────────────────────────────────────────────
  const [exam,         setExam]         = useState<LiveExam | null>(null);
  const [studentId,    setStudentId]    = useState<string | null>(null);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [loadingExam,  setLoadingExam]  = useState(true);

  // ── Exam state ────────────────────────────────────────────────────────────
  const [answers,       setAnswers]       = useState<Record<string, number>>({});
  const [currentQ,      setCurrentQ]      = useState(0);
  const [timeLeft,      setTimeLeft]      = useState(30 * 60);
  const [submitted,     setSubmitted]     = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [submitError,   setSubmitError]   = useState<string | null>(null);
  const [score,         setScore]         = useState<ScoreResult | null>(null);

  // ── Load exam ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!examId) return;

    if (isDemoMode) {
      // Demo: use mock data
      const mock = mockConnectExams.find(e => e.id === examId) ?? mockConnectExams[0];
      if (!mock) { setLoadError('Exam not found'); setLoadingExam(false); return; }
      setExam({
        id:               mock.id,
        title:            mock.title,
        total_marks:      mock.totalMarks,
        passing_marks:    mock.passingMarks,
        duration_minutes: mock.durationMinutes,
        status:           'published',
        available_from:   null,
        available_until:  null,
        questions: mock.questions.map(q => ({
          id:              q.id,
          question_number: q.questionNumber,
          type:            q.type as 'multiple-choice' | 'true-false',
          question:        q.question,
          options:         q.options,
          correct_answer:  q.correctAnswer,
          marks:           q.marks,
        })),
      });
      setStudentId('demo-student');
      setTimeLeft(mock.durationMinutes * 60);
      setLoadingExam(false);
      return;
    }

    // Live: load from Supabase
    async function loadExam() {
      setLoadingExam(true);
      try {
        // 1. Load exam + questions (cast to any to avoid Supabase join type inference)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: examRaw, error: examErr } = await (supabase as any)
          .from('connect_exams')
          .select(`
            id, title, total_marks, passing_marks, duration_minutes,
            status, available_from, available_until,
            connect_exam_questions (
              id, question_number, type, question, options, correct_answer, marks
            )
          `)
          .eq('id', examId)
          .eq('status', 'published')
          .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const examData = examRaw as any;

        if (examErr || !examData) {
          setLoadError('Exam not found or not available');
          return;
        }

        const liveExam: LiveExam = {
          id:               examData.id,
          title:            examData.title,
          total_marks:      examData.total_marks,
          passing_marks:    examData.passing_marks,
          duration_minutes: examData.duration_minutes,
          status:           examData.status,
          available_from:   examData.available_from,
          available_until:  examData.available_until,
          questions: (examData.connect_exam_questions as LiveQuestion[]).sort(
            (a, b) => a.question_number - b.question_number
          ),
        };
        setExam(liveExam);
        setTimeLeft(liveExam.duration_minutes * 60);

        // 2. Load the student record
        if (profile?.id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: student } = await (supabase as any)
            .from('connect_students')
            .select('id')
            .eq('user_id', profile.id)
            .single();
          if (student) setStudentId((student as { id: string }).id);
        }

        // 3. Check if already submitted
        if (profile?.id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existing } = await (supabase as any)
            .from('connect_exam_results')
            .select('id, score, total_marks, percentage, passed')
            .eq('exam_id', examId)
            .maybeSingle();

          if (existing) {
            setScore({
              score:        existing.score,
              total:        existing.total_marks,
              pct:          Number(existing.percentage),
              passed:       existing.passed,
              passingMarks: examData.passing_marks,
            });
            setSubmitted(true);
          }
        }
      } catch (e) {
        setLoadError('Failed to load exam. Please check your connection.');
      } finally {
        setLoadingExam(false);
      }
    }

    loadExam();
  }, [examId, isDemoMode, profile?.id]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (submitted || loadingExam || !exam) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted, loadingExam, exam]);

  const formatTime = (s: number) => {
    const m   = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!exam) return;
    setSubmitting(true);
    setSubmitError(null);
    setShowConfirm(false);

    if (isDemoMode) {
      // Demo: grade client-side
      let correct = 0;
      exam.questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) correct += q.marks;
      });
      const pct = exam.total_marks > 0 ? Math.round((correct / exam.total_marks) * 100) : 0;
      setScore({
        score: correct, total: exam.total_marks, pct,
        passed: correct >= exam.passing_marks,
        passingMarks: exam.passing_marks,
      });
      setSubmitted(true);
      setSubmitting(false);
      return;
    }

    // Live: call API
    if (!studentId) {
      setSubmitError('Student record not found. Please contact support.');
      setSubmitting(false);
      return;
    }

    try {
      const body: SubmitExamBody = { examId: exam.id, studentId, answers };
      const res = await fetch('/api/connect/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as SubmitExamResponse;

      if (!data.success) {
        // narrow to the error branch
        setSubmitError((data as Extract<SubmitExamResponse, { success: false }>).error);
        setSubmitting(false);
        return;
      }

      const ok = data as Extract<SubmitExamResponse, { success: true }>;
      setScore({
        score:        ok.score,
        total:        ok.totalMarks,
        pct:          ok.percentage,
        passed:       ok.passed,
        passingMarks: ok.passingMarks,
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [exam, answers, isDemoMode, studentId]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingExam) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
          <p className="text-sm text-gray-500">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (loadError || !exam) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center">
          <WifiOff className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">{loadError ?? 'Exam not found.'}</p>
          <Link href="/connect/student" className="text-[#BF0A30] text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const questions = exam.questions;
  const q         = questions[currentQ];
  const answered  = Object.keys(answers).length;
  const unanswered = questions.length - answered;

  // ── Results screen ─────────────────────────────────────────────────────────
  if (submitted && score) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className={`rounded-2xl border p-8 text-center shadow-lg mb-4 ${
            score.passed
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40'
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              score.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {score.passed
                ? <CheckCircle className="w-10 h-10 text-green-600" />
                : <AlertTriangle className="w-10 h-10 text-red-500" />}
            </div>
            <h2 className={`text-2xl font-bold mb-1 ${score.passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {score.passed ? 'Congratulations!' : 'Keep Going'}
            </h2>
            <p className={`text-sm mb-5 ${score.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {score.passed ? 'You passed this exam!' : 'You did not meet the passing requirement.'}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Your Score', value: `${score.score}/${score.total}` },
                { label: 'Percentage', value: `${score.pct}%` },
                { label: 'Pass Mark', value: `${score.passingMarks}/${score.total}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/60 dark:bg-black/20 rounded-xl py-3 px-2">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="h-3 bg-gray-200 dark:bg-[#2D2D2D] rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${score.passed ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${score.pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              Pass mark: {Math.round((score.passingMarks / score.total) * 100)}%
            </p>
          </div>

          <Link
            href="/connect/student"
            className="block w-full py-3 text-center bg-[#BF0A30] text-white text-sm font-medium rounded-2xl hover:bg-[#A0021F] transition-colors shadow-md shadow-[#BF0A30]/20"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Confirm submit dialog ───────────────────────────────────────────────────
  if (showConfirm) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Submit Exam?</h3>
          {unanswered > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You have {unanswered} unanswered question{unanswered !== 1 ? 's' : ''}. They will be marked incorrect.
              </p>
            </div>
          )}
          {unanswered === 0 && (
            <p className="text-sm text-gray-500 mb-4">All {questions.length} questions answered. Ready to submit?</p>
          )}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400">
              Go Back
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium hover:bg-[#A0021F] flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Exam UI ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A]">

      {/* Sticky header */}
      <header className="sticky top-4 z-30 mx-4">
        <div className="flex items-center justify-between px-5 h-14 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5">
          <Link href="/connect/student" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Exit
          </Link>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px] text-center">
            {exam.title}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold tabular-nums ${
            timeLeft <= 60
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
              : timeLeft <= 300
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="px-4 pb-8 mt-4 max-w-2xl mx-auto">

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4 mt-4">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2D2D2D] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#BF0A30] to-[#A00020] rounded-full transition-all"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">{currentQ + 1}/{questions.length}</span>
        </div>

        {/* Question bubble nav */}
        <div className="flex flex-wrap gap-2 mb-5">
          {questions.map((question, i) => (
            <button
              key={question.id}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                i === currentQ
                  ? 'bg-[#BF0A30] text-white shadow-md shadow-[#BF0A30]/25'
                  : answers[question.id] !== undefined
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-white dark:bg-[#141414] border border-gray-200/70 dark:border-white/[0.05] text-gray-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        {q && (
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-6 shadow-sm mb-4">
            <div className="mb-5">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 rounded-lg mb-2">
                Q{q.question_number} · {q.marks} mark{q.marks !== 1 ? 's' : ''}
              </span>
              <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">{q.question}</p>
            </div>
            <div className="space-y-2.5">
              {q.options.map((option, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-[#BF0A30] bg-[#BF0A30]/5 dark:bg-[#BF0A30]/10'
                        : 'border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.10] hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected ? 'border-[#BF0A30] bg-[#BF0A30]' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-sm font-medium ${selected ? 'text-[#BF0A30]' : 'text-gray-700 dark:text-gray-200'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium hover:bg-[#A0021F] transition-colors shadow-md shadow-[#BF0A30]/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium hover:bg-[#A0021F] transition-colors shadow-md shadow-[#BF0A30]/20"
            >
              <Send className="w-4 h-4" /> Submit Exam
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-400">{answered}/{questions.length} answered</p>
          {unanswered > 0 && <p className="text-xs text-amber-500">{unanswered} unanswered</p>}
        </div>

        {/* Demo badge */}
        {isDemoMode && (
          <div className="mt-6 py-2 px-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl text-center">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Demo mode — scoring is instant and local. In live mode results are saved to the database.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
