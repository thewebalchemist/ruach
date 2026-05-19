// pages/connect/student/index.tsx
// Connect class student dashboard — journey, schedule, exams, graduation progress

import Link from 'next/link';
import {
  Award, Calendar, BookOpen, ClipboardList, AlertTriangle,
  CheckCircle, XCircle, Clock, FileText, Video, ExternalLink,
  Bell, LogOut, ChevronRight, MapPin, Users, Sparkles,
  Sun, Moon, ArrowRight, GraduationCap, Star
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  mockConnectStudents, mockConnectCohorts, mockConnectSessions,
  mockConnectExams, mockConnectUsers, getTeacherById
} from '@/data/connect';

// Simulate logged-in student
const CURRENT_USER_ID = 'user-new-001';

export default function ConnectStudentDashboard() {
  const { theme, setTheme } = useTheme();

  const student = mockConnectStudents.find(s => s.userId === CURRENT_USER_ID);
  const user    = mockConnectUsers.find(u => u.id === CURRENT_USER_ID);
  const cohort  = student ? mockConnectCohorts.find(c => c.id === student.cohortId) : null;
  const sessions = cohort ? mockConnectSessions.filter(s => s.cohortId === cohort.id) : [];
  const exams    = cohort ? mockConnectExams.filter(e => e.cohortId === cohort.id && e.status === 'published') : [];
  const teacher  = cohort ? getTeacherById(cohort.teacherId) : null;

  if (!student || !user || !cohort) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-[#BF0A30]" />
          </div>
          <h2 className="font-black text-gray-900 dark:text-white mb-2">No Enrollment Found</h2>
          <p className="text-gray-500 mb-6 text-sm">You are not enrolled in a Connect class yet.</p>
          <Link href="/connect/register" className="btn btn-primary gap-2">
            Register for Connect Class <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const attendedSessions        = student.attendance.filter(a => a.present).length;
  const totalSessionsAttendable = sessions.filter(s => s.isCompleted).length;
  const isAtRisk    = student.totalAttendancePercent < 80 && totalSessionsAttendable > 0;
  const canTakeExam = student.totalAttendancePercent >= 80;

  const upcomingSessions = sessions.filter(s => !s.isCompleted);
  const nextSession      = upcomingSessions[0];

  // Progress toward graduation
  const attendanceMet = student.totalAttendancePercent >= cohort.passRequirement.minAttendancePercent;
  const examMet       = student.averageExamScore >= cohort.passRequirement.minExamScore;

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center shadow-md shadow-[#BF0A30]/20">
              <img src="/images/ruaach.png" alt="Ruach" className="w-6 h-6 rounded-full opacity-90" />
            </div>
            <div>
              <p className="font-black text-gray-900 dark:text-white text-sm leading-tight tracking-tight">Connect Class</p>
              <p className="text-[10px] text-gray-400 leading-tight">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <Bell className="w-4 h-4" />
              {student.warnings.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full ring-2 ring-white dark:ring-[#111]" />
              )}
            </button>
            <div className="ml-1 w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#BF0A30]/20">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <button className="p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5 animate-fade-in">

        {/* ── Welcome Hero ─────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#BF0A30] via-[#A0021F] to-[#6B0015] rounded-2xl p-6 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '10px 10px',
          }} />
          <div className="absolute right-6 bottom-0 opacity-10">
            <GraduationCap className="w-32 h-32" />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white/70 text-sm mb-1">Welcome back,</p>
                <h1 className="text-2xl font-black tracking-tight mb-1">{user.firstName} {user.lastName}</h1>
                <p className="text-white/80 font-medium">{cohort.name}</p>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider leading-none">Admission No.</p>
                    <p className="text-white font-black text-sm tracking-wide">{student.admissionNumber}</p>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-black rounded-xl ${
                    student.status === 'completed'   ? 'bg-green-500 text-white' :
                    student.status === 'in-progress' ? 'bg-white/20 text-white border border-white/30' :
                    student.status === 'failed'      ? 'bg-red-800 text-white' :
                    'bg-white/20 text-white'
                  }`}>
                    {student.status === 'completed' ? 'Graduated' :
                     student.status === 'in-progress' ? 'In Progress' :
                     student.status}
                  </span>
                </div>
              </div>

              {student.certificateIssued && (
                <div className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-amber-300" />
                  </div>
                  <p className="text-xs text-white/70 font-semibold">Certified</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Warning Banner ───────────────────────────────────────────────────── */}
        {student.warnings.length > 0 && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 dark:text-red-200 text-sm">Attention Required</p>
              {student.warnings.map(w => (
                <p key={w.id} className="text-sm text-red-700 dark:text-red-300 mt-0.5">{w.message}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Stats Row ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Sessions Attended',
              value: `${attendedSessions}/${totalSessionsAttendable}`,
              icon: ClipboardList,
              color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
              alert: false,
            },
            {
              label: 'Attendance Rate',
              value: `${student.totalAttendancePercent}%`,
              icon: Calendar,
              color: isAtRisk ? 'text-red-600' : 'text-green-600',
              bg: isAtRisk ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20',
              alert: isAtRisk,
              sub: isAtRisk ? 'Min. 80% required' : undefined,
            },
            {
              label: 'Exams Taken',
              value: student.examResults.length,
              icon: BookOpen,
              color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20',
              alert: false,
            },
            {
              label: 'Exam Average',
              value: `${student.averageExamScore}%`,
              icon: Star,
              color: student.averageExamScore >= cohort.passRequirement.minExamScore ? 'text-amber-600' : 'text-gray-600',
              bg: 'bg-amber-50 dark:bg-amber-900/20',
              alert: false,
            },
          ].map(stat => (
            <div key={stat.label} className={`bg-white dark:bg-[#1A1A1A] rounded-2xl border p-4 ${
              stat.alert ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-[#2D2D2D]'
            }`}>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-black leading-none ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              {stat.sub && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{stat.sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Graduation Progress ──────────────────────────────────────────────── */}
        <div className={`rounded-2xl border p-5 ${
          student.canGraduate
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent'
            : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D]'
        }`}>
          {student.canGraduate ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-lg">Ready to Graduate!</p>
                <p className="text-white/80 text-sm">You have met all requirements. Congratulations!</p>
              </div>
              <Sparkles className="w-6 h-6 text-white/70 flex-shrink-0" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-100 dark:bg-[#252525] rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Graduation Checklist</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                  attendanceMet
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40'
                }`}>
                  {attendanceMet
                    ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                  <div>
                    <p className={`text-sm font-bold ${attendanceMet ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>Attendance</p>
                    <p className="text-xs text-gray-500">{student.totalAttendancePercent}% / {cohort.passRequirement.minAttendancePercent}% required</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                  examMet
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40'
                    : 'bg-gray-50 dark:bg-[#252525] border-gray-200 dark:border-[#333]'
                }`}>
                  {examMet
                    ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    : <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                  <div>
                    <p className={`text-sm font-bold ${examMet ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>Exam Score</p>
                    <p className="text-xs text-gray-500">{student.averageExamScore}% / {cohort.passRequirement.minExamScore}% required</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Next Session Card ─────────────────────────────────────────────────── */}
        {nextSession && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-blue-200 dark:border-blue-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Next Session</p>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-base mb-1">{nextSession.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(nextSession.date).toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric' })}
                  {' · '}{nextSession.startTime} – {nextSession.endTime}
                </p>
                {nextSession.venue && (
                  <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />{nextSession.venue}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-xl ${
                  nextSession.type === 'virtual'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {nextSession.type === 'virtual' ? 'Virtual' : 'In-person'}
                </span>
                {nextSession.meetingLink && (
                  <a href={nextSession.meetingLink} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary btn-sm gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Join
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Main: Sessions + Exams ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Session list */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#2D2D2D]">
                <h2 className="section-title">Class Schedule</h2>
                <span className="text-xs text-gray-400">{sessions.length} sessions</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-[#2D2D2D]">
                {sessions.map(session => {
                  const rec        = student.attendance.find(a => a.sessionId === session.id);
                  const isUpcoming = !session.isCompleted;
                  return (
                    <div key={session.id} className={`p-4 ${isUpcoming ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isUpcoming
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            : rec?.present
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                        }`}>
                          {isUpcoming
                            ? <Clock className="w-5 h-5" />
                            : rec?.present
                            ? <CheckCircle className="w-5 h-5" />
                            : <XCircle className="w-5 h-5" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{session.title}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              session.type === 'virtual'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>{session.type}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(session.date).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {' · '}{session.startTime}
                          </p>
                          {!isUpcoming && rec && (
                            <p className={`text-xs mt-0.5 font-medium ${rec.present ? 'text-green-600' : 'text-red-500'}`}>
                              {rec.present ? 'Attended' : 'Missed'}
                            </p>
                          )}
                          {isUpcoming && session.meetingLink && (
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#BF0A30] font-semibold mt-1">
                              <Video className="w-3 h-3" /> Join <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {session.venue && <p className="text-xs text-gray-400 mt-0.5">📍 {session.venue}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exams */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#2D2D2D]">
                <h2 className="section-title">Exams & Assignments</h2>
              </div>
              {exams.length > 0 ? (
                <div className="divide-y divide-gray-50 dark:divide-[#2D2D2D]">
                  {exams.map(exam => {
                    const result      = student.examResults.find(r => r.examId === exam.id);
                    const now         = new Date();
                    const availFrom   = new Date(exam.availableFrom);
                    const availUntil  = new Date(exam.availableUntil);
                    const isAvailable = now >= availFrom && now <= availUntil && !result;

                    return (
                      <div key={exam.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">{exam.title}</h3>
                          <p className="text-xs text-gray-400">
                            {exam.questions.length} questions · {exam.durationMinutes} min · Pass: {exam.passingMarks}/{exam.totalMarks}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {result ? (
                            <div className={`text-right ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                              <p className="text-xl font-black">{result.percentage}%</p>
                              <p className="text-xs font-bold">{result.passed ? 'Passed' : 'Failed'}</p>
                            </div>
                          ) : isAvailable && canTakeExam ? (
                            <Link href={`/connect/student/exams/${exam.id}`} className="btn btn-primary btn-sm gap-1.5">
                              Start <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : !canTakeExam ? (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                              Need 80% attendance
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {now < availFrom ? `Opens ${availFrom.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}` : 'Closed'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-[#252525] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No exams available yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your teacher will publish exams here</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Teacher */}
            {teacher && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                <h2 className="section-title mb-4">Your Teacher</h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white font-black shadow-md shadow-[#BF0A30]/20">
                    {teacher.firstName[0]}{teacher.lastName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{teacher.fullName}</p>
                    <p className="text-xs text-gray-500">{teacher.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cohort details */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <h2 className="section-title mb-4">Cohort Info</h2>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'Start Date',      value: new Date(cohort.startDate).toLocaleDateString('en-KE') },
                  { label: 'End Date',        value: new Date(cohort.endDate).toLocaleDateString('en-KE') },
                  { label: 'Total Sessions',  value: sessions.length },
                  { label: 'Min. Attendance', value: `${cohort.passRequirement.minAttendancePercent}%` },
                  { label: 'Min. Exam Score', value: `${cohort.passRequirement.minExamScore}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-xs">{value}</span>
                  </div>
                ))}
              </div>
              {cohort.whatsappLink && (
                <a href={cohort.whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Join WhatsApp Group
                </a>
              )}
            </div>

            {/* Resources */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <h2 className="section-title mb-4">Resources</h2>
              {sessions.flatMap(s => s.resources).length > 0 ? (
                <div className="space-y-2">
                  {sessions.flatMap(s => s.resources).map(resource => (
                    <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl hover:bg-gray-100 dark:hover:bg-[#2D2D2D] transition-colors">
                      <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#BF0A30]" />
                      </div>
                      <span className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">{resource.title}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No resources yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
