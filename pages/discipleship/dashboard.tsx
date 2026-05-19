import Link from 'next/link';
import { Users, BookOpen, GraduationCap, Award, ChevronRight, Plus, Upload, AlertTriangle, Bell, Settings } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { mockDiscipleshipCourses, mockDiscipleshipCohorts, mockDiscipleshipStudents } from '@/data/discipleship';
import { mockMembers } from '@/data';

export default function DiscipleshipDashboardPage() {
  const activeCohorts = mockDiscipleshipCohorts.filter(c => c.status === 'active');
  const totalEnrolled = activeCohorts.reduce((sum, c) => sum + c.enrolledCount, 0);
  const atRiskStudents = mockDiscipleshipStudents.filter(s => s.totalAttendancePercent < 80);

  // Mock stats
  const graduatesCount = 145;
  const completionRate = 89;

  return (
    <DiscipleshipLayout title="Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discipleship Management</h1>
          <p className="text-gray-500">Track spiritual growth and course progress</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <BookOpen className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockDiscipleshipCourses.length}</p>
          <p className="text-sm text-gray-500">Levels</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Users className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCohorts.length}</p>
          <p className="text-sm text-gray-500">Active Cohorts</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <GraduationCap className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEnrolled}</p>
          <p className="text-sm text-gray-500">Enrolled</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-amber-300 dark:border-amber-800 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-600">{atRiskStudents.length}</p>
          <p className="text-sm text-gray-500">At Risk</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Award className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
          <p className="text-sm text-gray-500">Completion</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Link href="/discipleship/cohorts/new" className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors text-center">
          <div className="w-10 h-10 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">New Cohort</span>
        </Link>
        <Link href="/discipleship/attendance/import" className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors text-center">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Import Attendance</span>
        </Link>
        <Link href="/discipleship/exams/new" className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors text-center">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Create Exam</span>
        </Link>
        <Link href="/discipleship/students" className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors text-center">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Students</span>
        </Link>
        <Link href="/discipleship/graduates" className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors text-center">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Graduates</span>
        </Link>
        <Link href="/discipleship/courses" className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors text-center">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-gray-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Courses</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Discipleship Levels</h2>
              <Link href="/discipleship/courses" className="text-sm text-[#BF0A30] hover:underline">Manage</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {mockDiscipleshipCourses.map(course => {
                const cohorts = mockDiscipleshipCohorts.filter(c => c.courseId === course.id);
                const activeCt = cohorts.filter(c => c.status === 'active').length;
                
                return (
                  <div key={course.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#252525]">
                    <div className="w-14 h-14 rounded-xl bg-[#BF0A30] text-white flex items-center justify-center text-xl font-bold">
                      L{course.level}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.durationWeeks} weeks • {course.totalSessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{activeCt}</p>
                      <p className="text-xs text-gray-500">active cohorts</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* At Risk Alert */}
          {atRiskStudents.length > 0 && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Students At Risk</h3>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                {atRiskStudents.length} students have attendance below 80%.
              </p>
              <Link href="/discipleship/students?filter=at-risk" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
                View All At Risk
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Cohorts */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Active Cohorts</h2>
            <div className="space-y-3">
              {activeCohorts.slice(0, 4).map(cohort => {
                const course = mockDiscipleshipCourses.find(c => c.id === cohort.courseId);
                return (
                  <div key={cohort.id} className="p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{cohort.name}</p>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    </div>
                    <p className="text-xs text-gray-500">Level {course?.level} • {cohort.enrolledCount} students</p>
                  </div>
                );
              })}
            </div>
            <Link href="/discipleship/cohorts" className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">
              View All Cohorts
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="text-gray-900 dark:text-white">3 students completed Level 1</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-gray-900 dark:text-white">New cohort "L2-2026B" started</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                <div>
                  <p className="text-gray-900 dark:text-white">5 new enrollments</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graduates Stats */}
          <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-3">Total Graduates</h3>
            <p className="text-4xl font-bold mb-2">{graduatesCount}</p>
            <p className="text-sm text-white/70">Across all 3 levels</p>
            <Link href="/discipleship/graduates" className="block mt-4 text-center py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
              View Graduates
            </Link>
          </div>
        </div>
      </div>
    </DiscipleshipLayout>
  );
}