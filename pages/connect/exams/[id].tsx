import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Users, CheckCircle, XCircle, Clock,
  BookOpen, TrendingUp, Send, Eye, Pencil, Loader2,
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';

type ExamStatus = 'draft' | 'published' | 'closed';
interface Exam {
  id: string; title: string; description: string | null; status: ExamStatus;
  total_marks: number; passing_marks: number; duration_minutes: number;
  available_from: string | null; available_until: string | null; cohort_id: string;
}
interface Cohort { id: string; name: string; }
interface Question { id: string; question: string; question_type: string; marks: number; }
interface ResultRow {
  student_id: string; score: number; total_marks: number; percentage: number; passed: boolean; submitted_at: string;
  connect_students: { admission_number: string; profiles: { first_name: string; last_name: string } | null } | null;
}

const STATUS_LABEL: Record<ExamStatus, string> = { draft: 'Draft', published: 'Published', closed: 'Closed' };
const STATUS_COLOR: Record<ExamStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
};

export default function ExamDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [loading, setLoading]   = useState(true);
  const [exam, setExam]         = useState<Exam | null>(null);
  const [cohort, setCohort]     = useState<Cohort | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults]   = useState<ResultRow[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: e } = await supabase
      .from('connect_exams')
      .select('id, title, description, status, total_marks, passing_marks, duration_minutes, available_from, available_until, cohort_id')
      .eq('id', id)
      .single();
    setExam(e);

    if (e) {
      const [cohortRes, questionsRes, resultsRes, countRes] = await Promise.all([
        supabase.from('connect_cohorts').select('id, name').eq('id', e.cohort_id).single(),
        supabase.from('connect_exam_questions').select('id, question, question_type, marks').eq('exam_id', id),
        supabase.from('connect_exam_results').select('student_id, score, total_marks, percentage, passed, submitted_at, connect_students(admission_number, profiles(first_name, last_name))').eq('exam_id', id),
        supabase.from('connect_students').select('id', { count: 'exact', head: true }).eq('cohort_id', e.cohort_id),
      ]);
      setCohort(cohortRes.data ?? null);
      setQuestions(questionsRes.data ?? []);
      setResults((resultsRes.data as any) ?? []);
      setStudentCount(countRes.count ?? 0);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(status: ExamStatus) {
    if (!exam) return;
    setUpdating(true);
    const { error } = await supabase.from('connect_exams').update({ status }).eq('id', exam.id);
    setUpdating(false);
    if (!error) setExam(prev => prev ? { ...prev, status } : prev);
  }

  if (loading) {
    return <ConnectLayout title="Exam"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></ConnectLayout>;
  }

  if (!exam) {
    return (
      <ConnectLayout title="Exam Not Found">
        <div className="text-center py-20 text-gray-500">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>Exam not found.</p>
          <Link href="/connect/exams" className="text-[#BF0A30] text-sm mt-2 inline-block">← Back to Exams</Link>
        </div>
      </ConnectLayout>
    );
  }

  const passCount = results.filter(r => r.passed).length;
  const avgScore  = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
  const submitted = results.length;
  const pending   = Math.max(0, studentCount - submitted);

  return (
    <ConnectLayout title={exam.title}>
      <Link href="/connect/exams" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </Link>

      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 mb-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLOR[exam.status]}`}>
                {STATUS_LABEL[exam.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {cohort?.name} · {questions.length} questions · {exam.duration_minutes} min · Pass: {exam.passing_marks}/{exam.total_marks}
            </p>
            {exam.description && (
              <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/connect/exams/new?edit=${exam.id}`} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors">
              <Pencil className="w-4 h-4" /> Edit
            </Link>
            {exam.status === 'draft' && (
              <button onClick={() => toggleStatus('published')} disabled={updating} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" /> Publish
              </button>
            )}
            {exam.status === 'published' && (
              <button onClick={() => toggleStatus('closed')} disabled={updating} className="flex items-center gap-1.5 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50">
                <Clock className="w-4 h-4" /> Close Exam
              </button>
            )}
            {exam.status === 'closed' && (
              <button onClick={() => toggleStatus('published')} disabled={updating} className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" /> Re-open
              </button>
            )}
          </div>
        </div>

        {(exam.available_from || exam.available_until) && (
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
            {exam.available_from && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Opens: {new Date(exam.available_from).toLocaleString()}
              </span>
            )}
            {exam.available_until && <span>Closes: {new Date(exam.available_until).toLocaleString()}</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Submitted',     value: submitted,          color: 'text-gray-900 dark:text-white' },
          { label: 'Pending',       value: pending,            color: 'text-amber-600' },
          { label: 'Pass Rate',     value: results.length > 0 ? `${Math.round((passCount / results.length) * 100)}%` : '—', color: 'text-green-600' },
          { label: 'Avg Score',     value: results.length > 0 ? `${avgScore}%` : '—', color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.04] flex items-center justify-between">
              <p className="font-semibold text-gray-900 dark:text-white">Student Results</p>
              <span className="text-xs text-gray-500">{submitted}/{studentCount} submitted</span>
            </div>

            {results.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No submissions yet</p>
                {exam.status === 'draft' && (
                  <p className="text-xs text-gray-400 mt-1">Publish the exam so students can take it.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                      {['Student', 'Score', 'Percentage', 'Result', 'Submitted', ''].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => {
                      const first = r.connect_students?.profiles?.first_name ?? '';
                      const last  = r.connect_students?.profiles?.last_name ?? '';
                      return (
                        <tr key={r.student_id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${r.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {first[0]}{last[0]}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{first} {last}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.score}/{r.total_marks}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-gray-200 dark:bg-[#2D2D2D] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${r.passed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${r.percentage}%` }} />
                              </div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{r.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 text-xs font-semibold ${r.passed ? 'text-green-600' : 'text-red-500'}`}>
                              {r.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              {r.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.submitted_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Link href={`/connect/students/${r.student_id}`} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg inline-block">
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {pending > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.04] bg-amber-50 dark:bg-amber-900/10">
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  {pending} student{pending !== 1 ? 's' : ''} haven't submitted yet
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.04]">
              <p className="font-semibold text-gray-900 dark:text-white">Questions ({questions.length})</p>
            </div>
            {questions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No questions yet.</p>
                <Link href={`/connect/exams/new?edit=${exam.id}`} className="text-xs text-[#BF0A30] mt-2 inline-block">Add questions →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/[0.02]">
                {questions.map((q, i) => (
                  <div key={q.id} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 capitalize">{q.question_type.replace('-', ' ')}</span>
                          <span className="text-[10px] text-gray-400">· {q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Score Distribution</p>
              </div>
              {[
                { label: '90–100%', count: results.filter(r => r.percentage >= 90).length, color: 'bg-green-500' },
                { label: '70–89%',  count: results.filter(r => r.percentage >= 70 && r.percentage < 90).length, color: 'bg-blue-500' },
                { label: '50–69%',  count: results.filter(r => r.percentage >= 50 && r.percentage < 70).length, color: 'bg-amber-500' },
                { label: 'Below 50%', count: results.filter(r => r.percentage < 50).length, color: 'bg-red-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3 mb-2.5 last:mb-0">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full`}
                      style={{ width: results.length > 0 ? `${(count / results.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ConnectLayout>
  );
}
