import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Calendar, GraduationCap, Plus, TrendingUp,
  Upload, BookOpen, AlertTriangle, Bell, Search, Eye,
  FileText, MoreVertical, ChevronRight, X, CheckCircle
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import {
  mockConnectCohorts, mockConnectStudents, mockConnectSessions,
  mockConnectExams, mockLegacyRequests, mockTeachers, getUserById,
  getTeacherById,
} from '@/data/connect';

type Tab = 'overview' | 'students' | 'cohorts' | 'exams';

export default function ConnectDashboardPage() {
  const [selectedCohortId, setSelectedCohortId] = useState(mockConnectCohorts[0]?.id ?? '');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [activeTab,         setActiveTab]         = useState<Tab>('overview');
  const [warnStudentId,     setWarnStudentId]     = useState<string | null>(null);
  const [warnMsg,           setWarnMsg]           = useState('');

  const teacher       = mockTeachers[0];
  const activeCohorts = mockConnectCohorts.filter(c => c.status === 'active');
  const openCohorts   = mockConnectCohorts.filter(c => c.status === 'registration-open');
  const pendingLegacy = mockLegacyRequests.filter(r => r.status === 'pending');

  const cohort         = mockConnectCohorts.find(c => c.id === selectedCohortId);
  const students       = mockConnectStudents.filter(s => s.cohortId === selectedCohortId);
  const sessions       = mockConnectSessions.filter(s => s.cohortId === selectedCohortId);
  const exams          = mockConnectExams.filter(e => e.cohortId === selectedCohortId);
  const totalEnrolled  = activeCohorts.reduce((sum, c) => sum + c.enrolledCount, 0);
  const atRisk         = students.filter(s => s.totalAttendancePercent < 80);
  const completedSess  = sessions.filter(s => s.isCompleted).length;

  const filteredStudents = students.filter(s => {
    const user = getUserById(s.userId);
    if (!user) return false;
    return `${user.fullName} ${s.admissionNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sendWarning = () => {
    // production: POST /api/connect/students/:id/warnings
    setWarnStudentId(null);
    setWarnMsg('');
  };

  return (
    <ConnectLayout title="Dashboard" notificationCount={pendingLegacy.length}>

      {/* ── Warning modal ── */}
      {warnStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200 dark:border-white/[0.06] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Send Warning</h3>
              <button onClick={() => setWarnStudentId(null)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={warnMsg}
              onChange={e => setWarnMsg(e.target.value)}
              rows={4}
              placeholder="Write a message to the student about their attendance..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-white/[0.03] text-sm mb-4 resize-none focus:outline-none focus:border-[#BF0A30] text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            <div className="flex gap-3">
              <button onClick={() => setWarnStudentId(null)} className="flex-1 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5">
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome back, {teacher.firstName}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Connect Class Management</p>
        </div>
        {pendingLegacy.length > 0 && (
          <Link
            href="/connect/legacy-requests"
            className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-medium"
          >
            <Bell className="w-4 h-4" />
            {pendingLegacy.length} pending
          </Link>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { icon: Calendar,      color: 'text-[#BF0A30]',  bg: 'bg-[#BF0A30]/8',   val: activeCohorts.length,  label: 'Active Cohorts'    },
          { icon: Users,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',   val: totalEnrolled,         label: 'Enrolled'          },
          { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20', val: atRisk.length,         label: 'At Risk'           },
          { icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', val: 520,                  label: 'Total Graduates'   },
          { icon: TrendingUp,    color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20', val: '87%',                 label: 'Completion Rate'   },
        ].map(({ icon: Icon, color, bg, val, label }) => (
          <div key={label} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{val}</p>
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
          { href: '/connect/legacy-requests',   icon: FileText,      bg: 'bg-amber-100 dark:bg-amber-900/30', ic: 'text-amber-600',   label: 'Legacy',      badge: pendingLegacy.length },
          { href: '/connect/graduates',         icon: GraduationCap, bg: 'bg-purple-100 dark:bg-purple-900/30', ic: 'text-purple-600', label: 'Graduates',  badge: 0 },
          { href: '/connect/settings',          icon: Users,         bg: 'bg-gray-100 dark:bg-gray-800',       ic: 'text-gray-600',    label: 'Students',    badge: 0 },
        ].map(({ href, icon: Icon, bg, ic, label, badge }) => (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center gap-2 p-3.5 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] hover:border-[#BF0A30]/50 shadow-sm transition-all text-center group"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
              <Icon className={`w-5 h-5 ${ic}`} />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
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
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Cohort Overview</h2>
                <select
                  value={selectedCohortId}
                  onChange={e => setSelectedCohortId(e.target.value)}
                  className="text-sm px-3 py-1.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                >
                  {mockConnectCohorts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-xl">
                {(['overview', 'students', 'cohorts', 'exams'] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-white dark:bg-[#252525] text-[#BF0A30] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
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
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>{cohort.status.replace('-', ' ')}</span>
                      )},
                      { label: 'Enrollment', value: <span className="font-bold text-gray-900 dark:text-white">{cohort.enrolledCount}/{cohort.maxCapacity}</span> },
                      { label: 'Sessions',   value: <span className="font-bold text-gray-900 dark:text-white">{completedSess}/{sessions.length} done</span> },
                      { label: 'At Risk',    value: <span className="font-bold text-amber-600">{atRisk.length}</span> },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        {value}
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Course Progress</span>
                      <span>{sessions.length > 0 ? Math.round((completedSess / sessions.length) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-[#2D2D2D] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#BF0A30] to-[#A0021F] rounded-full transition-all"
                        style={{ width: `${sessions.length > 0 ? (completedSess / sessions.length) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(cohort.startDate).toLocaleDateString()} – {new Date(cohort.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/connect/cohorts/${cohort.id}`} className="flex-1 py-2.5 text-center text-sm font-medium border border-[#BF0A30] text-[#BF0A30] rounded-xl hover:bg-[#BF0A30]/5 transition-colors">
                      View Full Cohort
                    </Link>
                    {cohort.whatsappLink && (
                      <a href={cohort.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 text-center text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
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
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] focus:outline-none focus:border-[#BF0A30] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {filteredStudents.map(student => {
                      const user = getUserById(student.userId);
                      if (!user) return null;
                      const risk = student.totalAttendancePercent < 80;
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${risk ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                              <p className="text-xs text-gray-400">{student.admissionNumber}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${risk ? 'text-red-500' : 'text-green-600'}`}>
                              {student.totalAttendancePercent}%
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
                  {mockConnectCohorts.map(c => {
                    const count = mockConnectStudents.filter(s => s.cohortId === c.id).length;
                    const tchr  = getTeacherById(c.teacherId);
                    return (
                      <Link
                        key={c.id}
                        href={`/connect/cohorts/${c.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-gray-400">{count} students · {tchr?.firstName} {tchr?.lastName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            c.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            c.status === 'registration-open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>{c.status.replace('-', ' ')}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#BF0A30] transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                  <Link
                    href="/connect/cohorts/new"
                    className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-[#2D2D2D] rounded-xl text-sm text-gray-500 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> New Cohort
                  </Link>
                </div>
              )}

              {/* Exams */}
              {activeTab === 'exams' && (
                <div className="space-y-3">
                  {exams.length > 0 ? exams.map(exam => (
                    <div key={exam.id} className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{exam.title}</p>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          exam.status === 'published' ? 'bg-green-100 text-green-800' :
                          exam.status === 'closed'    ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>{exam.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{exam.questions.length} questions · {exam.durationMinutes} min · Pass: {exam.passingMarks}/{exam.totalMarks}</p>
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
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Registration Open</h3>
            {openCohorts.length > 0 ? openCohorts.map(c => (
              <div key={c.id} className="p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Starts {new Date(c.startDate).toLocaleDateString()}</p>
                <p className="text-xs text-[#BF0A30] mt-0.5">{c.enrolledCount} enrolled</p>
              </div>
            )) : (
              <p className="text-sm text-gray-400">No open registrations</p>
            )}
            <Link href="/connect/cohorts/new" className="mt-2 block text-center py-2 text-sm font-medium border border-[#BF0A30] text-[#BF0A30] rounded-xl hover:bg-[#BF0A30]/5 transition-colors">
              Schedule New Cohort
            </Link>
          </div>

          {/* Pending legacy */}
          {pendingLegacy.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">Pending Verifications</h3>
              <div className="space-y-2">
                {pendingLegacy.slice(0, 3).map(req => (
                  <div key={req.id} className="p-2.5 bg-white/70 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{req.fullName}</p>
                    <p className="text-xs text-gray-500">Joined {req.yearJoined} · {req.yearsAsMember} yrs</p>
                  </div>
                ))}
              </div>
              <Link href="/connect/legacy-requests" className="mt-3 block text-center py-2 text-sm font-medium bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
                Review All ({pendingLegacy.length})
              </Link>
            </div>
          )}

          {/* Recent activity */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { dot: 'bg-green-500', text: '5 students marked present', sub: 'Session 2 · 2 hr ago' },
                { dot: 'bg-blue-500',  text: 'New student enrolled',      sub: 'John Kamau · Today' },
                { dot: 'bg-amber-500', text: 'Warning sent',              sub: 'Mary W. · Attendance' },
              ].map(({ dot, text, sub }) => (
                <div key={text} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${dot} mt-1.5 flex-shrink-0`} />
                  <div>
                    <p className="text-gray-800 dark:text-gray-200">{text}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connect Journey */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Connect Journey</h3>
            <div className="space-y-2.5">
              {['Salvation', 'Water Baptism', 'Holy Spirit', 'Membership'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{step}</p>
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