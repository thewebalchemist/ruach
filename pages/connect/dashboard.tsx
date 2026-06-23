import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Users, Calendar, GraduationCap, Plus, TrendingUp,
  Upload, BookOpen, AlertTriangle, Bell, Search, Eye,
  FileText, MoreVertical, ChevronRight, X, CheckCircle, Loader2
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Tab = 'overview' | 'students' | 'cohorts' | 'exams';

export default function ConnectDashboardPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const db = supabase as any;

  const [loading,           setLoading]           = useState(true);
  const [selectedCohortId,  setSelectedCohortId]  = useState('');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [activeTab,         setActiveTab]         = useState<Tab>('overview');
  const [warnStudentId,     setWarnStudentId]     = useState<string | null>(null);
  const [warnMsg,           setWarnMsg]           = useState('');

  const [allCohorts,        setAllCohorts]        = useState<any[]>([]);
  const [allStudents,       setAllStudents]       = useState<any[]>([]);
  const [allSessions,       setAllSessions]       = useState<any[]>([]);
  const [allExams,          setAllExams]          = useState<any[]>([]);
  const [legacyRequests,    setLegacyRequests]    = useState<any[]>([]);
  const [graduatesCount,    setGraduatesCount]    = useState(0);
  const [recentActivity,    setRecentActivity]    = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/connect'); return; }
    if (!['teacher', 'admin', 'pastor', 'leader'].includes(profile.role)) {
      router.push('/connect'); return;
    }
    load();
  }, [authLoading, profile]);

  async function load() {
    setLoading(true);
    const [
      { data: cohortData },
      { data: legacyData },
      { count: gradCount },
      { data: recentData },
    ] = await Promise.all([
      db.from('connect_cohorts')
        .select('*, profiles!connect_cohorts_teacher_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false }),
      db.from('legacy_member_requests')
        .select('*')
        .eq('status', 'pending'),
      supabase.from('connect_students')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed'),
      db.from('connect_students')
        .select('id, status, created_at, admission_number, profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const cohorts = (cohortData ?? []) as any[];
    setAllCohorts(cohorts);
    setLegacyRequests((legacyData ?? []) as any[]);
    setGraduatesCount(gradCount ?? 0);
    setRecentActivity((recentData ?? []) as any[]);

    // Set default selected cohort
    if (cohorts.length > 0 && !selectedCohortId) {
      const firstActive = cohorts.find((c: any) => c.status === 'active');
      setSelectedCohortId(firstActive?.id ?? cohorts[0].id);
    }

    setLoading(false);
  }

  // Reload students/sessions/exams when selectedCohortId changes
  useEffect(() => {
    if (!selectedCohortId) return;

    async function loadCohortData() {
      const [
        { data: studentData },
        { data: sessionData },
        { data: examData },
      ] = await Promise.all([
        db.from('connect_students')
          .select('*, profiles(first_name, last_name)')
          .eq('cohort_id', selectedCohortId),
        db.from('connect_sessions')
          .select('*')
          .eq('cohort_id', selectedCohortId)
          .order('created_at', { ascending: true }),
        db.from('connect_exams')
          .select('*')
          .eq('cohort_id', selectedCohortId),
      ]);

      setAllStudents((studentData ?? []) as any[]);
      setAllSessions((sessionData ?? []) as any[]);
      setAllExams((examData ?? []) as any[]);
    }

    loadCohortData();
  }, [selectedCohortId]);

  const sendWarning = () => {
    // production: POST /api/connect/students/:id/warnings
    setWarnStudentId(null);
    setWarnMsg('');
  };

  if (loading) return (
    <ConnectLayout title="Dashboard" notificationCount={0}>
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
      </div>
    </ConnectLayout>
  );

  const activeCohorts = allCohorts.filter(c => c.status === 'active');
  const openCohorts   = allCohorts.filter(c => c.status === 'registration-open');

  const cohort         = allCohorts.find(c => c.id === selectedCohortId);
  const students       = allStudents;
  const sessions       = allSessions;
  const exams          = allExams;
  const totalEnrolled  = activeCohorts.reduce((sum: number, c: any) => sum + (c.enrolled_count ?? 0), 0);
  const atRisk         = students.filter((s: any) => (s.total_attendance_percent ?? 100) < 80);
  const completedSess  = sessions.filter((s: any) => s.is_completed).length;

  const completionRate = students.length > 0
    ? Math.round((students.filter((s: any) => s.status === 'completed').length / students.length) * 100) + '%'
    : '—';

  const filteredStudents = students.filter((s: any) => {
    const name = `${s.profiles?.first_name ?? ''} ${s.profiles?.last_name ?? ''} ${s.admission_number ?? ''}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <ConnectLayout title="Dashboard" notificationCount={legacyRequests.length}>

      {/* ── Warning modal ── */}
      {warnStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Send Warning</h3>
              <button onClick={() => setWarnStudentId(null)} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={warnMsg}
              onChange={e => setWarnMsg(e.target.value)}
              rows={4}
              placeholder="Write a message to the student about their attendance..."
              className="w-full px-4 py-3 border border-white/[0.06] rounded-xl bg-[#0A0C10] dark:bg-white/[0.03] text-sm mb-4 resize-none focus:outline-none focus:border-[#BF0A30] text-white placeholder:text-gray-400"
            />
            <div className="flex gap-3">
              <button onClick={() => setWarnStudentId(null)} className="flex-1 py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium text-white/50 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={sendWarning}
                disabled={!warnMsg.trim()}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-amber-600 transition-colors"
              >
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Greeting ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">
            Welcome back, {profile?.first_name}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Connect Class Management</p>
        </div>
        {legacyRequests.length > 0 && (
          <Link
            href="/connect/legacy-requests"
            className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-medium"
          >
            <Bell className="w-4 h-4" />
            {legacyRequests.length} pending
          </Link>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { icon: Calendar,      color: 'text-[#BF0A30]',  bg: 'bg-[#BF0A30]/8',   val: activeCohorts.length,  label: 'Active Cohorts'    },
          { icon: Users,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',   val: totalEnrolled,         label: 'Enrolled'          },
          { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20', val: atRisk.length,         label: 'At Risk'           },
          { icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', val: graduatesCount,       label: 'Total Graduates'   },
          { icon: TrendingUp,    color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20', val: completionRate,        label: 'Completion Rate'   },
        ].map(({ icon: Icon, color, bg, val, label }) => (
          <div key={label} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-white">{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {[
          { href: '/connect/cohorts/new',       icon: Plus,          bg: 'bg-[#BF0A30]/10', ic: 'text-[#BF0A30]',   label: 'New Cohort',  badge: 0 },
          { href: '/connect/attendance/import', icon: Upload,        bg: 'bg-blue-100 dark:bg-blue-900/30',    ic: 'text-blue-600',    label: 'Attendance',  badge: 0 },
          { href: '/connect/exams/new',         icon: BookOpen,      bg: 'bg-green-100 dark:bg-green-900/30',  ic: 'text-green-600',   label: 'Create Exam', badge: 0 },
          { href: '/connect/legacy-requests',   icon: FileText,      bg: 'bg-amber-100 dark:bg-amber-900/30', ic: 'text-amber-600',   label: 'Legacy',      badge: legacyRequests.length },
          { href: '/connect/graduates',         icon: GraduationCap, bg: 'bg-purple-100 dark:bg-purple-900/30', ic: 'text-purple-600', label: 'Graduates',  badge: 0 },
          { href: '/connect/settings',          icon: Users,         bg: 'bg-white/10',       ic: 'text-gray-600',    label: 'Students',    badge: 0 },
        ].map(({ href, icon: Icon, bg, ic, label, badge }) => (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center gap-2 p-3.5 bg-[#12151C] rounded-2xl border border-white/[0.06]/70 hover:border-[#BF0A30]/50 shadow-sm transition-all text-center group"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
              <Icon className={`w-5 h-5 ${ic}`} />
            </div>
            <span className="text-xs font-medium text-white/70">{label}</span>
            {badge > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left: cohort panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-white">Cohort Overview</h2>
                <select
                  value={selectedCohortId}
                  onChange={e => setSelectedCohortId(e.target.value)}
                  className="text-sm px-3 py-1.5 border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
                >
                  {allCohorts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                {(['overview', 'students', 'cohorts', 'exams'] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-[#12151C] text-[#BF0A30] shadow-sm'
                        : 'text-gray-500 hover:text-white/70 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">

              {/* Overview */}
              {activeTab === 'overview' && cohort && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Status', value: (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                          cohort.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          cohort.status === 'registration-open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-white/5 text-white/70 dark:bg-gray-800'
                        }`}>{cohort.status.replace('-', ' ')}</span>
                      )},
                      { label: 'Enrollment', value: <span className="font-bold text-white">{cohort.enrolled_count ?? 0}/{cohort.max_capacity ?? 0}</span> },
                      { label: 'Sessions',   value: <span className="font-bold text-white">{completedSess}/{sessions.length} done</span> },
                      { label: 'At Risk',    value: <span className="font-bold text-amber-600">{atRisk.length}</span> },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#0A0C10] rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        {value}
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#0A0C10] rounded-xl p-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Course Progress</span>
                      <span>{sessions.length > 0 ? Math.round((completedSess / sessions.length) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#BF0A30] to-[#A0021F] rounded-full transition-all"
                        style={{ width: `${sessions.length > 0 ? (completedSess / sessions.length) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : '—'} – {cohort.end_date ? new Date(cohort.end_date).toLocaleDateString() : '—'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/connect/cohorts/${cohort.id}`} className="flex-1 py-2.5 text-center text-sm font-medium border border-[#BF0A30] text-[#BF0A30] rounded-xl hover:bg-[#BF0A30]/5 transition-colors">
                      View Full Cohort
                    </Link>
                    {cohort.whatsapp_link && (
                      <a href={cohort.whatsapp_link} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 text-center text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                        WhatsApp Group
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Students */}
              {activeTab === 'students' && (
                <div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search name or admission no..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#0A0C10] focus:outline-none focus:border-[#BF0A30] text-white"
                    />
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {filteredStudents.map((student: any) => {
                      const firstName = student.profiles?.first_name ?? '';
                      const lastName  = student.profiles?.last_name ?? '';
                      const risk = (student.total_attendance_percent ?? 100) < 80;
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-[#0A0C10] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${risk ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                              {firstName[0] ?? ''}{lastName[0] ?? ''}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{firstName} {lastName}</p>
                              <p className="text-xs text-gray-400">{student.admission_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${risk ? 'text-red-500' : 'text-green-600'}`}>
                              {student.total_attendance_percent ?? '—'}%
                            </span>
                            {risk && (
                              <button
                                onClick={() => setWarnStudentId(student.id)}
                                className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            )}
                            <Link href={`/connect/students/${student.id}`} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{filteredStudents.length} students</p>
                </div>
              )}

              {/* Cohorts (replaces sessions) */}
              {activeTab === 'cohorts' && (
                <div className="space-y-2">
                  {allCohorts.map((c: any) => {
                    const teacherName = c.profiles
                      ? `${c.profiles.first_name ?? ''} ${c.profiles.last_name ?? ''}`
                      : '';
                    return (
                      <Link
                        key={c.id}
                        href={`/connect/cohorts/${c.id}`}
                        className="flex items-center justify-between p-3 bg-[#0A0C10] rounded-xl hover:bg-white/5 dark:hover:bg-[#252525] transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.enrolled_count ?? 0} students · {teacherName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            c.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            c.status === 'registration-open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-white/5 text-white/50 dark:bg-gray-800'
                          }`}>{c.status.replace('-', ' ')}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#BF0A30] transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                  <Link
                    href="/connect/cohorts/new"
                    className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-white/10 dark:border-[#2D2D2D] rounded-xl text-sm text-gray-500 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> New Cohort
                  </Link>
                </div>
              )}

              {/* Exams */}
              {activeTab === 'exams' && (
                <div className="space-y-3">
                  {exams.length > 0 ? exams.map((exam: any) => (
                    <div key={exam.id} className="p-4 bg-[#0A0C10] rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white">{exam.title}</p>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          exam.status === 'published' ? 'bg-green-100 text-green-800' :
                          exam.status === 'closed'    ? 'bg-red-100 text-red-800' :
                          'bg-white/5 text-gray-700'
                        }`}>{exam.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{exam.duration_minutes} min · Pass: {exam.passing_marks}/{exam.total_marks}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No exams yet for this cohort</p>
                    </div>
                  )}
                  <Link href="/connect/exams/new" className="block w-full py-2.5 text-center text-sm font-medium bg-[#BF0A30] text-white rounded-xl hover:bg-[#A0021F] transition-colors">
                    Create Exam
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* At-risk banner */}
          {atRisk.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  {atRisk.length} {atRisk.length === 1 ? 'student is' : 'students are'} at risk of not graduating
                </p>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">Attendance below 80%.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setWarnStudentId('all')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700"
                >
                  Warn All
                </button>
                <Link href="/connect/students?filter=at-risk" className="px-4 py-2 border border-amber-500 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">

          {/* Open registrations */}
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-3">Registration Open</h3>
            {openCohorts.length > 0 ? openCohorts.map((c: any) => (
              <div key={c.id} className="p-3 bg-[#0A0C10] rounded-xl mb-2">
                <p className="text-sm font-medium text-white">{c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Starts {c.start_date ? new Date(c.start_date).toLocaleDateString() : '—'}</p>
                <p className="text-xs text-[#BF0A30] mt-0.5">{c.enrolled_count ?? 0} enrolled</p>
              </div>
            )) : (
              <p className="text-sm text-gray-400">No open registrations</p>
            )}
            <Link href="/connect/cohorts/new" className="mt-2 block text-center py-2 text-sm font-medium border border-[#BF0A30] text-[#BF0A30] rounded-xl hover:bg-[#BF0A30]/5 transition-colors">
              Schedule New Cohort
            </Link>
          </div>

          {/* Pending legacy */}
          {legacyRequests.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">Pending Verifications</h3>
              <div className="space-y-2">
                {legacyRequests.slice(0, 3).map((req: any) => (
                  <div key={req.id} className="p-2.5 bg-white/70 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-sm font-medium text-white">{req.full_name}</p>
                    <p className="text-xs text-gray-500">Joined {req.year_joined} · {req.years_as_member} yrs</p>
                  </div>
                ))}
              </div>
              <Link href="/connect/legacy-requests" className="mt-3 block text-center py-2 text-sm font-medium bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
                Review All ({legacyRequests.length})
              </Link>
            </div>
          )}

          {/* Recent activity */}
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((row: any) => (
                <div key={row.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    row.status === 'completed' ? 'bg-green-500' :
                    row.status === 'enrolled'  ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className="text-gray-800">
                      {row.profiles?.first_name ?? ''} {row.profiles?.last_name ?? ''} — {row.status}
                    </p>
                    <p className="text-xs text-gray-400">
                      {row.admission_number ? `#${row.admission_number} · ` : ''}
                      {new Date(row.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400">No recent activity</p>
              )}
            </div>
          </div>

          {/* Connect Journey */}
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-3">Connect Journey</h3>
            <div className="space-y-2.5">
              {['Salvation', 'Water Baptism', 'Holy Spirit', 'Membership'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{step}</p>
                    <p className="text-xs text-gray-400">Session {i + 1}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-gray-200 dark:text-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ConnectLayout>
  );
}
