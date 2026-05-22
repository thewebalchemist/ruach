import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Clock, CheckCircle, AlertTriangle, Send,
  ChevronLeft, ChevronRight, Loader2, WifiOff,
  Maximize2, Flag, ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type QType = 'single' | 'multi' | 'true-false' | 'multiple-choice';
type Phase = 'loading' | 'pre-start' | 'taking' | 'confirm' | 'done' | 'error';

interface LiveQuestion {
  id:              string;
  question_number: number;
  question_type:   QType;
  question:        string;
  options:         string[];
  correct_answers: number[];
  marks:           number;
}

interface LiveExam {
  id:               string;
  title:            string;
  total_marks:      number;
  passing_marks:    number;
  duration_minutes: number;
  questions:        LiveQuestion[];
}

interface ScoreResult {
  score:        number;
  total:        number;
  pct:          number;
  passed:       boolean;
  passingMarks: number;
}

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function DiscipleshipStudentExamPage() {
  const router      = useRouter();
  const { examId }  = router.query as { examId: string };
  const { profile } = useAuth();

  const [phase,       setPhase]       = useState<Phase>('loading');
  const [exam,        setExam]        = useState<LiveExam | null>(null);
  const [studentId,   setStudentId]   = useState<string | null>(null);
  const [loadError,   setLoadError]   = useState('');

  const [answers,     setAnswers]     = useState<Record<string, number[]>>({});
  const [currentQ,    setCurrentQ]    = useState(0);
  const [flagged,     setFlagged]     = useState<Set<string>>(new Set());
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [score,       setScore]       = useState<ScoreResult | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [violations,    setViolations]    = useState(0);
  const violationsRef                     = useRef(0);
  const lastViolation                     = useRef(0);
  const autoSubmitSent                    = useRef(false);

  useEffect(() => {
    if (!examId) return;
    (async () => {
      try {
        const { data: raw, error } = await (supabase as any)
          .from('discipleship_exams')
          .select(`
            id, title, total_marks, passing_marks, duration_minutes,
            discipleship_exam_questions (
              id, question_number, question_type, type,
              question, options, correct_answers, correct_answer, marks
            )
          `)
          .eq('id', examId)
          .eq('status', 'published')
          .single();

        if (error || !raw) { setLoadError('Exam not found or not available'); setPhase('error'); return; }

        const questions: LiveQuestion[] = ((raw as any).discipleship_exam_questions ?? [])
          .map((q: any) => ({
            id:              q.id,
            question_number: q.question_number,
            question_type:   q.question_type ?? (q.type === 'true-false' ? 'true-false' : 'single'),
            question:        q.question,
            options:         q.options ?? [],
            correct_answers: q.correct_answers?.length ? q.correct_answers : (q.correct_answer != null ? [q.correct_answer] : [0]),
            marks:           q.marks,
          }))
          .sort((a: LiveQuestion, b: LiveQuestion) => a.question_number - b.question_number);

        setExam({
          id:               raw.id,
          title:            raw.title,
          total_marks:      raw.total_marks,
          passing_marks:    raw.passing_marks,
          duration_minutes: raw.duration_minutes,
          questions,
        });
        setTimeLeft(raw.duration_minutes * 60);

        if (profile?.id) {
          const { data: stu } = await (supabase as any)
            .from('discipleship_students').select('id').eq('user_id', profile.id).maybeSingle();
          if (stu) setStudentId((stu as any).id);

          const { data: existing } = await (supabase as any)
            .from('discipleship_exam_results')
            .select('id, score, total_marks, percentage, passed')
            .eq('exam_id', examId)
            .maybeSingle();

          if (existing) {
            setScore({
              score:        existing.score,
              total:        existing.total_marks,
              pct:          Number(existing.percentage),
              passed:       existing.passed,
              passingMarks: raw.passing_marks,
            });
            setPhase('done');
            return;
          }
        }

        setPhase('pre-start');
      } catch {
        setLoadError('Failed to load exam. Check your connection.');
        setPhase('error');
      }
    })();
  }, [examId, profile?.id]);

  useEffect(() => {
    if (phase !== 'taking') return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const recordViolation = useCallback(() => {
    const now = Date.now();
    if (now - lastViolation.current < 800) return;
    lastViolation.current = now;
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    if (violationsRef.current >= 3 && !autoSubmitSent.current) {
      autoSubmitSent.current = true;
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'taking') return;
    const onVisibility = () => { if (document.hidden) recordViolation(); };
    const onFullscreen = () => { if (!document.fullscreenElement) recordViolation(); };
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [phase, recordViolation]);

  async function startExam() {
    try { await document.documentElement.requestFullscreen(); } catch {}
    setPhase('taking');
  }

  function selectAnswer(qId: string, optIdx: number, qType: QType) {
    setAnswers(prev => {
      if (qType === 'multi') {
        const cur = new Set(prev[qId] ?? []);
        cur.has(optIdx) ? cur.delete(optIdx) : cur.add(optIdx);
        return { ...prev, [qId]: Array.from(cur).sort() };
      }
      return { ...prev, [qId]: [optIdx] };
    });
  }

  const handleSubmit = useCallback(async () => {
    if (!exam) return;
    setSubmitting(true);
    setSubmitError('');
    setPhase(p => p !== 'taking' ? p : 'confirm');

    if (!studentId) {
      setSubmitError('Student record not found. Contact support.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/discipleship/exams/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ examId: exam.id, studentId, answers }),
      });
      const data = await res.json();

      if (!data.success) {
        setSubmitError(data.error ?? 'Submission failed');
        setSubmitting(false);
        return;
      }

      setScore({
        score:        data.score,
        total:        data.totalMarks,
        pct:          data.percentage,
        passed:       data.passed,
        passingMarks: data.passingMarks,
      });
      setPhase('done');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch {
      setSubmitError('Network error. Please try again.');
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, studentId, answers]);

  if (phase === 'loading') return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
    </div>
  );

  if (phase === 'error') return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center px-4">
      <div className="text-center">
        <WifiOff className="w-10 h-10 text-white/30 mx-auto mb-3" />
        <p className="text-white/50 text-sm mb-4">{loadError || 'Exam not found.'}</p>
        <Link href="/discipleship/student" className="text-[#BF0A30] text-sm">Back to Dashboard</Link>
      </div>
    </div>
  );

  if (phase === 'pre-start' && exam) return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#141414] rounded-3xl border border-white/[0.07] p-8 shadow-2xl">
          <h1 className="text-white text-2xl mb-1" style={H}>{exam.title}</h1>
          <p className="text-white/40 text-sm mb-6">Kingdom Discipleship Class</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              ['Questions', exam.questions.length],
              ['Duration',  `${exam.duration_minutes} min`],
              ['Pass Mark', `${exam.passing_marks}/${exam.total_marks}`],
            ].map(([k, v]) => (
              <div key={String(k)} className="bg-white/[0.04] rounded-2xl p-3 text-center">
                <p className="text-white text-lg font-bold" style={H}>{v}</p>
                <p className="text-white/35 text-xs">{k}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 space-y-2">
            <p className="text-amber-400 text-xs font-bold flex items-center gap-1.5" style={H}>
              <ShieldAlert className="w-3.5 h-3.5" /> Exam Integrity Policy
            </p>
            <ul className="text-amber-300/70 text-xs space-y-1 pl-5 list-disc">
              <li>This exam runs in full screen.</li>
              <li>Switching tabs or minimising the window is detected.</li>
              <li>3 violations will auto-submit your exam.</li>
              <li>The timer cannot be paused once started.</li>
            </ul>
          </div>
          <button onClick={startExam}
            className="w-full py-3.5 bg-[#BF0A30] hover:bg-[#A0021F] text-white rounded-2xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#BF0A30]/30"
            style={H}>
            <Maximize2 className="w-4 h-4" /> Begin Exam
          </button>
        </div>
      </div>
    </div>
  );

  if (phase === 'done' && score) return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className={`rounded-3xl border p-8 text-center mb-4 ${
          score.passed ? 'bg-green-900/10 border-green-800/30' : 'bg-red-900/10 border-red-800/30'
        }`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            score.passed ? 'bg-green-900/30' : 'bg-red-900/30'
          }`}>
            {score.passed
              ? <CheckCircle className="w-10 h-10 text-green-400" />
              : <AlertTriangle className="w-10 h-10 text-red-400" />}
          </div>
          <h2 className={`text-2xl mb-1 ${score.passed ? 'text-green-300' : 'text-red-300'}`} style={H}>
            {score.passed ? 'Congratulations!' : 'Keep Going'}
          </h2>
          <p className={`text-sm mb-6 ${score.passed ? 'text-green-400/70' : 'text-red-400/70'}`}>
            {score.passed ? 'You passed this exam!' : `Pass mark is ${score.passingMarks}/${score.total}.`}
          </p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              ['Score',      `${score.score}/${score.total}`],
              ['Percentage', `${score.pct}%`],
              ['Pass Mark',  `${Math.round((score.passingMarks / score.total) * 100)}%`],
            ].map(([k, v]) => (
              <div key={String(k)} className="bg-white/[0.04] rounded-2xl py-3 px-2">
                <p className="text-lg text-white font-bold" style={H}>{v}</p>
                <p className="text-white/35 text-xs">{k}</p>
              </div>
            ))}
          </div>
          <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${score.passed ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${score.pct}%` }} />
          </div>
        </div>
        <Link href="/discipleship/student"
          className="block w-full py-3.5 text-center bg-[#BF0A30] text-white rounded-2xl font-black hover:bg-[#A0021F] transition-colors shadow-lg shadow-[#BF0A30]/20"
          style={H}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  if (!exam) return null;
  const questions  = exam.questions;
  const q          = questions[currentQ];
  const answered   = Object.keys(answers).filter(id => answers[id].length > 0).length;
  const unanswered = questions.length - answered;

  if (phase === 'confirm') return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#141414] rounded-3xl border border-white/[0.07] p-6">
        <h3 className="text-white text-lg mb-2" style={H}>Submit Exam?</h3>
        {unanswered > 0 && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300 text-sm">{unanswered} unanswered question{unanswered !== 1 ? 's' : ''} will be marked incorrect.</p>
          </div>
        )}
        {unanswered === 0 && (
          <p className="text-white/40 text-sm mb-4">All {questions.length} questions answered. Ready?</p>
        )}
        {submitError && <p className="text-red-400 text-sm mb-4">{submitError}</p>}
        <div className="flex gap-3">
          <button onClick={() => setPhase('taking')} disabled={submitting}
            className="flex-1 py-2.5 border border-white/[0.07] rounded-2xl text-sm text-white/50 disabled:opacity-40">
            Go Back
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 bg-[#BF0A30] text-white rounded-2xl text-sm font-black hover:bg-[#A0021F] flex items-center justify-center gap-2 disabled:opacity-60"
            style={H}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );

  const isMulti = q?.question_type === 'multi';

  return (
    <div className="fixed inset-0 bg-[#0A0C10] flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between h-12 px-4 bg-white/[0.04] border border-white/[0.07] rounded-2xl">
          <span className="text-white/50 text-sm truncate max-w-[180px]" style={H}>{exam.title}</span>
          {violations > 0 && (
            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold" style={H}>
              <ShieldAlert className="w-3.5 h-3.5" /> {violations}/3 warnings
            </span>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold tabular-nums ${
            timeLeft <= 60 ? 'bg-red-900/30 text-red-400' : timeLeft <= 300 ? 'bg-amber-900/30 text-amber-400' : 'bg-white/[0.05] text-white/60'
          }`} style={H}>
            <Clock className="w-3.5 h-3.5" /> {fmt(timeLeft)}
          </div>
        </div>
      </header>

      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex flex-wrap gap-1.5">
          {questions.map((question, i) => {
            const isAnswered = (answers[question.id]?.length ?? 0) > 0;
            const isFlagged  = flagged.has(question.id);
            return (
              <button key={question.id} onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors relative ${
                  i === currentQ
                    ? 'bg-[#BF0A30] text-white shadow-md shadow-[#BF0A30]/30'
                    : isAnswered
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/[0.05] border border-white/[0.08] text-white/40'
                }`} style={H}>
                {i + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-[#0A0C10]" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-white/25">
          <span>{answered}/{questions.length} answered</span>
          {flagged.size > 0 && <span className="text-amber-400">{flagged.size} flagged for review</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {q && (
          <div className="bg-white/[0.03] rounded-3xl border border-white/[0.07] p-6">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider" style={H}>Q{q.question_number}</span>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                  {isMulti && (
                    <span className="text-[10px] font-bold text-[#BF0A30]/70 uppercase tracking-wider px-2 py-0.5 bg-[#BF0A30]/10 rounded-full">
                      Multi-select
                    </span>
                  )}
                </div>
                <p className="text-white text-base font-semibold leading-relaxed">{q.question}</p>
              </div>
              <button onClick={() => setFlagged(p => {
                const s = new Set(p); s.has(q.id) ? s.delete(q.id) : s.add(q.id); return s;
              })} className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                flagged.has(q.id) ? 'bg-amber-400/20 text-amber-400' : 'bg-white/[0.04] text-white/25 hover:text-white/50'
              }`}>
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {isMulti && (
              <p className="text-white/30 text-xs mb-3">Select all that apply. You must choose all correct answers to earn marks.</p>
            )}

            <div className="space-y-2.5">
              {q.options.map((option, i) => {
                const curAnswers = answers[q.id] ?? [];
                const selected  = curAnswers.includes(i);
                return (
                  <button key={i} onClick={() => selectAnswer(q.id, i, q.question_type)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all ${
                      selected ? 'border-[#BF0A30] bg-[#BF0A30]/10' : 'border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.02]'
                    }`}>
                    <div className={`flex-shrink-0 flex items-center justify-center transition-colors ${
                      isMulti
                        ? `w-5 h-5 rounded border-2 ${selected ? 'border-[#BF0A30] bg-[#BF0A30]' : 'border-white/20'}`
                        : `w-5 h-5 rounded-full border-2 ${selected ? 'border-[#BF0A30] bg-[#BF0A30]' : 'border-white/20'}`
                    }`}>
                      {selected && (
                        isMulti
                          ? <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                          : <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-white/60'}`}>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 pb-4 pt-2 flex items-center gap-3">
        <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-white/[0.07] rounded-2xl text-sm text-white/40 disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/[0.06] text-white/70 rounded-2xl text-sm font-bold hover:bg-white/[0.09] transition-colors"
            style={H}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setPhase('confirm')}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#BF0A30] text-white rounded-2xl text-sm font-black hover:bg-[#A0021F] transition-colors shadow-lg shadow-[#BF0A30]/20"
            style={H}>
            <Send className="w-4 h-4" /> Submit Exam
          </button>
        )}
      </div>
    </div>
  );
}
