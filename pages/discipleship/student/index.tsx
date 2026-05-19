import { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, Calendar, Clock, CheckCircle, AlertTriangle, 
  Video, MapPin, BookOpen, Award, Bell, Settings, LogOut, 
  ChevronRight, ExternalLink
} from 'lucide-react';
import { 
  mockDiscipleshipCohorts, mockDiscipleshipSessions, mockDiscipleshipStudents, 
  mockDiscipleshipExams, mockDiscipleshipCourses
} from '@/data/discipleship';

// Mock current user student
const mockCurrentStudent = mockDiscipleshipStudents[0];
const mockCurrentUser = {
  id: 'user-member-001',
  firstName: 'John',
  lastName: 'Kamau',
  fullName: 'John Mwangi Kamau',
  memberId: 'RT-00125',
  email: 'john.kamau@gmail.com',
};

export default function DiscipleshipStudentDashboard() {
  const student = mockCurrentStudent;
  const user = mockCurrentUser;
  
  const cohort = mockDiscipleshipCohorts.find(c => c.id === student?.cohortId);
  const course = cohort ? mockDiscipleshipCourses.find(c => c.id === cohort.courseId) : null;
  const sessions = mockDiscipleshipSessions.filter(s => s.cohortId === student?.cohortId);
  const exams = mockDiscipleshipExams.filter(e => e.cohortId === student?.cohortId);
  
  const completedSessions = sessions.filter(s => s.isCompleted).length;
  const totalSessions = sessions.length;
  const nextSession = sessions.find(s => !s.isCompleted);
  
  const attendedSessions = student?.attendance.filter(a => a.present).length || 0;
  const totalAttendedSessions = student?.attendance.length || 0;
  const attendancePercent = totalAttendedSessions > 0 
    ? Math.round((attendedSessions / totalAttendedSessions) * 100) 
    : 0;
  
  const isAtRisk = attendancePercent < 80;
  const canTakeExam = exams.some(e => e.status === 'published');

  if (!student || !cohort) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center p-4">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Not Enrolled</h1>
          <p className="text-gray-500 mb-6">You are not currently enrolled in any discipleship class.</p>
          <Link href="/discipleship/enroll" className="inline-flex items-center gap-2 px-6 py-3 bg-[#BF0A30] text-white rounded-lg font-medium">
            Enroll Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2D2D2D]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#BF0A30] to-[#8B0000] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Kingdom Discipleship</p>
                <p className="text-xs text-gray-500">Level {course?.level} • {course?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-5 h-5" />
                {student.warnings.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {student.warnings.length}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName}</p>
                  <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Warning Banner */}
        {isAtRisk && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">Attendance Warning</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Your attendance is at {attendancePercent}%. You need at least 80% to graduate. 
                  Please attend the remaining sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">{cohort.name}</p>
              <h1 className="text-2xl font-bold mb-2">Level {course?.level}: {course?.title}</h1>
              <p className="text-white/80">{cohort.schedule}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center relative">
                  <svg className="w-20 h-20 absolute -rotate-90">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                    <circle 
                      cx="40" cy="40" r="36" fill="none" stroke="white" strokeWidth="4" 
                      strokeDasharray={`${(completedSessions / totalSessions) * 226} 226`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xl font-bold">{completedSessions}/{totalSessions}</span>
                </div>
                <p className="text-sm text-white/70 mt-2">Sessions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 text-center">
                <p className={`text-2xl font-bold ${isAtRisk ? 'text-red-600' : 'text-green-600'}`}>{attendancePercent}%</p>
                <p className="text-sm text-gray-500">Attendance</p>
              </div>
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.examResults.length}</p>
                <p className="text-sm text-gray-500">Exams Taken</p>
              </div>
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.averageExamScore || '-'}%</p>
                <p className="text-sm text-gray-500">Avg Score</p>
              </div>
            </div>

            {/* Next Session */}
            {nextSession && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#BF0A30]" />
                  Next Session
                </h2>
                <div className="bg-[#BF0A30]/5 border border-[#BF0A30]/20 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{nextSession.title}</h3>
                      <p className="text-sm text-gray-500">{nextSession.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      nextSession.type === 'virtual' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {nextSession.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(nextSession.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {nextSession.startTime} - {nextSession.endTime}
                    </span>
                    {nextSession.type === 'physical' ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {nextSession.venue}
                      </span>
                    ) : (
                      <a href={nextSession.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#BF0A30] hover:underline">
                        <Video className="w-4 h-4" />
                        Join Meeting
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* All Sessions */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
              <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
                <h2 className="font-semibold text-gray-900 dark:text-white">All Sessions</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {sessions.map(session => {
                  const attendanceRecord = student.attendance.find(a => a.sessionId === session.id);
                  return (
                    <div key={session.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.isCompleted 
                            ? attendanceRecord?.present ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {session.isCompleted ? (
                            attendanceRecord?.present ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <span className="font-bold">{session.sessionNumber}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{session.title}</p>
                          <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {session.isCompleted ? (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            attendanceRecord?.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {attendanceRecord?.present ? 'Present' : 'Absent'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cohort Info */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Cohort Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Admission No.</span>
                  <span className="font-semibold text-[#BF0A30]">{student.admissionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium">{new Date(cohort.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date</span>
                  <span className="font-medium">{new Date(cohort.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{course?.durationWeeks} weeks</span>
                </div>
              </div>
              {cohort.whatsappLink && (
                <a href={cohort.whatsappLink} target="_blank" rel="noopener noreferrer" className="block mt-4 text-center py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  Join WhatsApp Group
                </a>
              )}
            </div>

            {/* Exams */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#BF0A30]" />
                Exams
              </h2>
              {exams.length > 0 ? (
                <div className="space-y-3">
                  {exams.map(exam => {
                    const result = student.examResults.find(r => r.examId === exam.id);
                    const isAvailable = exam.status === 'published' && !result;
                    return (
                      <div key={exam.id} className="p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{exam.title}</p>
                          {result ? (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {result.percentage}%
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isAvailable ? 'Available' : exam.status}
                            </span>
                          )}
                        </div>
                        {isAvailable && (
                          <Link href={`/discipleship/student/exam/${exam.id}`} className="block w-full text-center py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]">
                            Take Exam
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No exams scheduled yet</p>
              )}
            </div>

            {/* Graduation Progress */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#BF0A30]" />
                Graduation Progress
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Attendance (min 80%)</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${attendancePercent >= 80 ? 'text-green-600' : 'text-red-600'}`}>{attendancePercent}%</span>
                    {attendancePercent >= 80 ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Exam (min 70%)</span>
                  <div className="flex items-center gap-2">
                    {student.examResults.length > 0 ? (
                      <>
                        <span className={`font-bold ${student.averageExamScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>{student.averageExamScore}%</span>
                        {student.averageExamScore >= 70 ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                      </>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-[#2D2D2D]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Can Graduate?</span>
                    {student.canGraduate ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Yes
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                        Not Yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Level */}
            {course?.level && course.level < 3 && (
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-5 text-white">
                <h3 className="font-semibold mb-2">Ready for Level {course.level + 1}?</h3>
                <p className="text-sm text-white/80 mb-4">Complete this level to unlock the next stage of your discipleship journey.</p>
                <Link href="/discipleship/enroll" className="block text-center py-2 bg-white text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-50">
                  View Next Level
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}