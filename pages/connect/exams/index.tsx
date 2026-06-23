import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { mockConnectExams, mockConnectCohorts } from '@/data/connect';

export default function ExamsPage() {
  const [cohortF, setCohortF] = useState('all');

  const filtered = mockConnectExams.filter(e => cohortF === 'all' || e.cohortId === cohortF);

  const STATUS_ICON = {
    draft:     <Clock className="w-4 h-4 text-gray-400" />,
    published: <CheckCircle className="w-4 h-4 text-green-500" />,
    closed:    <XCircle className="w-4 h-4 text-red-400" />,
  };

  const STATUS_BADGE: Record<string, string> = {
    draft:     'bg-white/5 text-white/70 dark:bg-gray-800',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <ConnectLayout title="Exams">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Exams</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mockConnectExams.length} exams created</p>
        </div>
        <Link
          href="/connect/exams/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-xl hover:bg-[#A0021F] shadow-md shadow-[#BF0A30]/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </Link>
      </div>

      {/* Cohort filter */}
      <div className="flex gap-3 mb-5">
        <select
          value={cohortF}
          onChange={e => setCohortF(e.target.value)}
          className="px-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
        >
          <option value="all">All Cohorts</option>
          {mockConnectCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-16 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No exams yet</p>
            <Link href="/connect/exams/new" className="mt-3 inline-block px-4 py-2 bg-[#BF0A30] text-white text-sm font-medium rounded-xl">Create First Exam</Link>
          </div>
        ) : filtered.map(exam => {
          const cohort = mockConnectCohorts.find(c => c.id === exam.cohortId);
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
                    <p className="text-sm text-gray-500">{cohort?.name} · {exam.questions.length} questions · {exam.durationMinutes} min</p>
                    <p className="text-xs text-gray-400 mt-1">Pass: {exam.passingMarks}/{exam.totalMarks} marks · Available {new Date(exam.availableFrom).toLocaleDateString()} – {new Date(exam.availableUntil).toLocaleDateString()}</p>
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
    </ConnectLayout>
  );
}