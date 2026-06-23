import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, Award,
  Calendar, BookOpen, Phone, Mail, X, Send,
  GraduationCap, TrendingUp, User, MessageSquare, Loader2
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const db = supabase as any;

type Tab = 'attendance' | 'exams' | 'warnings';

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { profile: authUser } = useAuth();

  const [loading,        setLoading]        = useState(true);
  const [student,        setStudent]        = useState<any>(null);
  const [cohort,         setCohort]         = useState<any>(null);
  const [sessions,       setSessions]       = useState<any[]>([]);
  const [attendance,     setAttendance]     = useState<any[]>([]);
  const [exams,          setExams]          = useState<any[]>([]);
  const [examResults,    setExamResults]    = useState<any[]>([]);
  const [warnings,       setWarnings]       = useState<any[]>([]);
  const [activeTab,      setActiveTab]      = useState<Tab>('attendance');
  const [showWarnModal,  setShowWarnModal]  = useState(false);
  const [warnMessage,    setWarnMessage]    = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    if (!authUser) return;

    async function load() {
      setLoading(true);

      // Load student with profile
      const { data: studentData } = await db
        .from('connect_students')
        .select('*, profiles(first_name, last_name, full_name, email, phone)')
        .eq('id', id)
        .single();

      if (!studentData) {
        setLoading(false);
        return;
      }
      setStudent(studentData);

      // Load cohort, sessions, attendance, exams, results, warnings in parallel
      const [cohortRes, sessionsRes, attendanceRes, examsRes, resultsRes, warningsRes] = await Promise.all([
        db.from('connect_cohorts').select('*').eq('id', studentData.cohort_id).single(),
        db.from('connect_sessions').select('*').eq('cohort_id', studentData.cohort_id).order('session_number'),
        db.from('connect_attendance').select('*').eq('student_id', id),
        db.from('connect_exams').select('*').eq('cohort_id', studentData.cohort_id),
        db.from('connect_exam_results').select('*').eq('student_id', id),
        db.from('connect_warnings').select('*').eq('student_id', id).order('sent_at', { ascending: false }),
      ]);

      if (cohortRes.data) setCohort(cohortRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (attendanceRes.data) setAttendance(attendanceRes.data);
      if (examsRes.data) setExams(examsRes.data);
      if (resultsRes.data) setExamResults(resultsRes.data);
      if (warningsRes.data) setWarnings(warningsRes.data);

      setLoading(false);
    }
    load();
  }, [router.isReady, authUser, id]);

  // Loading state
  if (loading) {
    return (
      <ConnectLayout title="Student">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
        </div>
      </ConnectLayout>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!student || !cohort) {
    return (
      <ConnectLayout title="Student Not Found">
        <div className="text-center py-20">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Student not found.</p>
          <p className="text-xs text-gray-400 mb-4">ID: {id}</p>
          <Link href="/connect/students" className="text-[#BF0A30] text-sm">← Back to Students</Link>
        </div>
      </ConnectLayout>
    );
  }

  const attendanceOk = student.total_attendance_percent >= (cohort.min_attendance_percent ?? 0);
  const examOk = student.average_exam_score >= (cohort.min_exam_score ?? 0) || examResults.length === 0;
  const isAtRisk = !attendanceOk || (!examOk && examResults.length > 0);

  const sendWarning = async () => {
    if (!warnMessage.trim()) return;
    await db.from('connect_warnings').insert({
      student_id: id,
      type: 'general',
      message: warnMessage.trim(),
      sent_by: authUser?.id ?? 'unknown',
    });
    // Refetch warnings
    const { data } = await db.from('connect_warnings').select('*').eq('student_id', id).order('sent_at', { ascending: false });
    if (data) setWarnings(data);
    setWarnMessage('');
    setShowWarnModal(false);
  };

  return (
    <ConnectLayout title={student.profiles?.full_name ?? 'Student'}>

      {/* ── Warn modal ── */}
      {showWarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#161616] rounded-2xl border border-gray-200 dark:border-white/[0.06] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Send Warning</h3>
              <button onClick={() => setShowWarnModal(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">This will be visible to {student.profiles?.first_name ?? 'the student'} on their dashboard.</p>
            <textarea
              value={warnMessage}
              onChange={e => setWarnMessage(e.target.value)}
              rows={4}
              placeholder="Type your warning message..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowWarnModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400">
                Cancel
              </button>
              <button
                onClick={sendWarning}
                disabled={!warnMessage.trim()}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-amber-600 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back ── */}
      <Link
        href={`/connect/cohorts/${cohort.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {cohort.name}
      </Link>

      {/* ── Profile header ── */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-6 mb-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#BF0A30] to-[#8B0000] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#BF0A30]/25">
              {student.profiles?.first_name?.[0] ?? ''}{student.profiles?.last_name?.[0] ?? ''}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{student.profiles?.full_name ?? '—'}</h1>
                {isAtRisk && <AlertTriangle className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-sm text-gray-500">{student.admission_number} · {cohort.name}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  student.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  student.status === 'completed'   ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {student.status === 'in-progress' ? 'In Progress' : student.status === 'completed' ? 'Completed' : 'Failed'}
                </span>
                {student.can_graduate && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Ready to Graduate
                  </span>
                )}
                {isAtRisk && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    At Risk
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${student.profiles?.email ?? ''}`} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <Mail className="w-4 h-4" /> Email
            </a>
            <a href={`tel:${student.profiles?.phone ?? ''}`} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors">
              <Phone className="w-4 h-4" /> Call
            </a>
            <button
              onClick={() => setShowWarnModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" /> Warn
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            {
              icon: Calendar, label: 'Attendance',
              value: `${student.total_attendance_percent}%`,
              color: attendanceOk ? 'text-green-600' : 'text-red-500',
              bg:    attendanceOk ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
            },
            {
              icon: TrendingUp, label: 'Exam Average',
              value: examResults.length > 0 ? `${student.average_exam_score}%` : '—',
              color: examOk ? 'text-blue-600' : 'text-red-500',
              bg:    'bg-blue-100 dark:bg-blue-900/30',
            },
            {
              icon: BookOpen, label: 'Sessions Attended',
              value: `${attendance.filter((a: any) => a.present).length}/${sessions.length}`,
              color: 'text-purple-600',
              bg:    'bg-purple-100 dark:bg-purple-900/30',
            },
            {
              icon: AlertTriangle, label: 'Warnings',
              value: warnings.length,
              color: warnings.length > 0 ? 'text-amber-600' : 'text-gray-500',
              bg:    warnings.length > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-[#1A1A1A]',
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3 text-center">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Graduation eligibility ── */}
      <div className={`rounded-2xl border p-4 mb-5 ${
        student.can_graduate
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40'
          : 'bg-white dark:bg-[#141414] border-gray-200/70 dark:border-white/[0.05]'
      } shadow-sm`}>
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className={`w-5 h-5 ${student.can_graduate ? 'text-green-600' : 'text-gray-400'}`} />
          <p className={`font-semibold ${student.can_graduate ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>
            {student.can_graduate ? 'Eligible to Graduate' : 'Graduation Requirements'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            {attendanceOk ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            <span className="text-gray-600 dark:text-gray-400">
              Attendance {student.total_attendance_percent}% / {cohort.min_attendance_percent ?? 0}% required
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {examOk ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
            <span className="text-gray-600 dark:text-gray-400">
              Exam score {student.average_exam_score}% / {cohort.min_exam_score ?? 0}% required
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white dark:bg-[#141414] border border-gray-200/70 dark:border-white/[0.05] p-1 rounded-2xl mb-5 shadow-sm">
        {([
          { id: 'attendance', label: 'Attendance' },
          { id: 'exams',      label: 'Exams' },
          { id: 'warnings',   label: `Warnings${warnings.length > 0 ? ` (${warnings.length})` : ''}` },
        ] as { id: Tab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-[#BF0A30] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Attendance tab ── */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.04]">
            <p className="font-semibold text-gray-900 dark:text-white">Session Attendance</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/[0.02]">
            {sessions.map((session: any) => {
              const record = attendance.find((a: any) => a.session_id === session.id);
              const present = record?.present;
              const isUpcoming = !session.is_completed;
              return (
                <div key={session.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUpcoming ? 'bg-gray-100 dark:bg-[#1A1A1A]' :
                    present    ? 'bg-green-100 dark:bg-green-900/30' :
                                 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {isUpcoming
                      ? <Calendar className="w-4 h-4 text-gray-400" />
                      : present
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{session.title}</p>
                    <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    isUpcoming ? 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500' :
                    present    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {isUpcoming ? 'Upcoming' : present ? 'Present' : 'Absent'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Exams tab ── */}
      {activeTab === 'exams' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.04]">
            <p className="font-semibold text-gray-900 dark:text-white">Exam Results</p>
          </div>
          {exams.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No exams for this cohort yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/[0.02]">
              {exams.map((exam: any) => {
                const result = examResults.find((r: any) => r.exam_id === exam.id);
                return (
                  <div key={exam.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{exam.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{exam.questions?.length ?? 0} questions · Pass: {exam.passing_marks}/{exam.total_marks}</p>
                      </div>
                      {result ? (
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xl font-bold ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                            {result.percentage}%
                          </p>
                          <p className={`text-xs font-medium ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </p>
                        </div>
                      ) : (
                        <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 dark:bg-[#1A1A1A] px-2.5 py-1 rounded-full">Not taken</span>
                      )}
                    </div>
                    {result && (
                      <div className="mt-3">
                        <div className="h-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{result.score}/{result.total_marks} marks · submitted {new Date(result.submitted_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Warnings tab ── */}
      {activeTab === 'warnings' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowWarnModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" /> Send Warning
            </button>
          </div>
          {warnings.length === 0 ? (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-12 text-center shadow-sm">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No warnings sent yet</p>
            </div>
          ) : warnings.map((w: any) => (
            <div key={w.id} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">{w.message}</p>
              <p className="text-xs text-amber-500 mt-2">{new Date(w.sent_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </ConnectLayout>
  );
}
