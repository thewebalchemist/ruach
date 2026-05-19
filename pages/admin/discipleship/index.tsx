import Link from 'next/link';
import { Plus, Users, BookOpen, CheckCircle, Clock, GraduationCap, Layers } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import {
  mockDiscipleshipCohorts,
  mockDiscipleshipStudents,
  mockDiscipleshipCourses,
  getUserById,
} from '@/data';
import { DiscipleshipLevel } from '@/types';

export default function AdminDiscipleshipPage() {
  const activeCohorts = mockDiscipleshipCohorts.filter(c => c.status === 'active');
  const openCohorts = mockDiscipleshipCohorts.filter(c => c.status === 'registration-open');
  const readyToGraduate = mockDiscipleshipStudents.filter(s => s.canGraduate && !s.graduatedAt);

  const levelStats = ([1, 2, 3] as DiscipleshipLevel[]).map(level => ({
    level,
    course: mockDiscipleshipCourses.find(c => c.level === level),
    cohorts: mockDiscipleshipCohorts.filter(c => c.level === level),
    students: mockDiscipleshipStudents.filter(s => s.level === level),
    active: mockDiscipleshipCohorts.filter(c => c.level === level && c.status === 'active').length,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'registration-open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'draft': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const levelColors: Record<DiscipleshipLevel, string> = {
    1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    2: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    3: 'bg-[#BF0A30]/10 text-[#BF0A30] dark:bg-[#BF0A30]/20',
  };

  return (
    <AdminLayout title="Discipleship">
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Discipleship (KDC)"
          subtitle="Manage Kingdom Disciples Course cohorts across all 3 levels"
        />
        <Link
          href="/admin/discipleship/cohorts/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white font-medium rounded-lg hover:bg-[#B00325] text-sm"
        >
          <Plus className="w-4 h-4" />New Cohort
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Active Cohorts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCohorts.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockDiscipleshipStudents.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Open for Reg.</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{openCohorts.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#BF0A30]" />
            </div>
            <span className="text-sm text-gray-500">Ready to Graduate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{readyToGraduate.length}</p>
        </div>
      </div>

      {/* Level Overview */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        {levelStats.map(({ level, course, cohorts, students, active }) => (
          <div key={level} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${levelColors[level]}`}>
                  Level {level}
                </span>
              </div>
              <GraduationCap className="w-5 h-5 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">
              {course?.title ?? `KDC Level ${level}`}
            </p>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course?.description}</p>
            <div className="flex items-center justify-between text-sm border-t border-gray-100 dark:border-[#2D2D2D] pt-3">
              <span className="text-gray-500">{cohorts.length} cohorts • {students.length} students</span>
              {active > 0 && (
                <span className="text-green-600 text-xs font-medium">{active} active</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* All Cohorts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Cohorts</h2>
            <Link href="/admin/discipleship/cohorts" className="text-sm text-[#BF0A30] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {mockDiscipleshipCohorts.slice(0, 6).map((cohort) => {
              const teacher = getUserById(cohort.teacherId);
              const cohortStudents = mockDiscipleshipStudents.filter(s => s.cohortId === cohort.id);
              return (
                <Link
                  key={cohort.id}
                  href={`/admin/discipleship/cohorts/${cohort.id}`}
                  className="block bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 hover:border-[#BF0A30]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 px-1.5 py-0.5 text-xs font-bold rounded ${levelColors[cohort.level]}`}>
                        L{cohort.level}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{cohort.name}</p>
                        <p className="text-sm text-gray-500">
                          {teacher?.firstName} {teacher?.lastName} • {cohortStudents.length}/{cohort.maxCapacity} students
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(cohort.status)}`}>
                      {cohort.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 ml-8">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(cohort.startDate).toLocaleDateString()} – {new Date(cohort.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {([1, 2, 3] as DiscipleshipLevel[]).map(level => (
                <Link
                  key={level}
                  href={`/admin/discipleship/cohorts/new?level=${level}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${levelColors[level]}`}>L{level}</span>
                  New Level {level} Cohort
                </Link>
              ))}
              <div className="border-t border-gray-100 dark:border-[#2D2D2D] my-2" />
              <Link
                href="/admin/discipleship/enroll"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Users className="w-4 h-4 text-[#BF0A30]" />Enroll Members
              </Link>
              <Link
                href="/admin/discipleship/graduates"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <CheckCircle className="w-4 h-4 text-[#BF0A30]" />
                Graduate Students
                {readyToGraduate.length > 0 && (
                  <span className="ml-auto bg-[#BF0A30] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {readyToGraduate.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}