import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Eye, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';

interface Exam {
  id: string; title: string; status: 'draft' | 'published' | 'closed';
  total_marks: number; passing_marks: number; duration_minutes: number;
  available_from: string | null; available_until: string | null; cohort_id: string;
  connect_exam_questions: { count: number }[];
}
interface Cohort { id: string; name: string; }

const STATUS_ICON = {
  draft:     <Clock className="w-4 h-4 text-gray-400" />,
  published: <CheckCircle className="w-4 h-4 text-green-500" />,
  closed:    <XCircle className="w-4 h-4 text-red-400" />,
};

const STATUS_BADGE: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function ExamsPage() {
  const [cohortF, setCohortF] = useState('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [examsRes, cohortsRes] = await Promise.all([
      supabase.from('connect_exams').select('id, title, status, total_marks, passing_marks, duration_minutes, available_from, available_until, cohort_id, connect_exam_questions(count)').order('created_at', { ascending: false }),
      supabase.from('connect_cohorts').select('id, name'),
    ]);
    setExams((examsRes.data as any) ?? []);
    setCohorts(cohortsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = exams.filter(e => cohortF === 'all' || e.cohort_id === cohortF);

  return (
    <ConnectLayout title="Exams">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Exams</h1>
          <p className="text-sm text-gray-500 mt-0.5">{exams.length} exams created</p>
        </div>
        <Link
          href="/connect/exams/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-xl hover:bg-[#A0021F] shadow-md shadow-[#BF0A30]/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </Link>
      </div>

      <div className="flex gap-3 mb-5">
        <select
          value={cohortF}
          onChange={e => setCohortF(e.target.value)}
          className="px-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
        >
          <option value="all">All Cohorts</option>
          {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-16 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No exams yet</p>
            <Link href="/connect/exams/new" className="mt-3 inline-block px-4 py-2 bg-[#BF0A30] text-white text-sm font-medium rounded-xl">Create First Exam</Link>
          </div>
        ) : filtered.map(exam => {
          const cohort = cohorts.find(c => c.id === exam.cohort_id);
          const questionCount = exam.connect_exam_questions?.[0]?.count ?? 0;
          return (
            <div key={exam.id} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{STATUS_ICON[exam.status]}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{exam.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_BADGE[exam.status]}`}>{exam.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{cohort?.name ?? '—'} · {questionCount} questions · {exam.duration_minutes} min</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Pass: {exam.passing_marks}/{exam.total_marks} marks
                      {exam.available_from && exam.available_until && (
                        <> · Available {new Date(exam.available_from).toLocaleDateString()} – {new Date(exam.available_until).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                <Link href={`/connect/exams/${exam.id}`} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.06] rounded-xl text-xs font-medium text-white/50 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </ConnectLayout>
  );
}
