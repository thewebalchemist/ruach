import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Users, CheckCircle, AlertCircle,
  Download, Plus, Trophy
} from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import {
  mockDiscipleshipCohorts, mockDiscipleshipStudents,
  mockDiscipleshipCourses, getUserById,
} from '@/data';
import { DiscipleshipLevel } from '@/types';

const levelColors: Record<DiscipleshipLevel, string> = {
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-purple-100 text-purple-800',
  3: 'bg-[#BF0A30]/10 text-[#BF0A30]',
};

export default function AdminDiscipleshipCohortPage() {
  const router = useRouter();
  const { id } = router.query;

  const cohort = mockDiscipleshipCohorts.find(c => c.id === id);
  if (!cohort) {
    return (
      <AdminLayout title="Not Found">
        <p className="text-gray-500">Cohort not found</p>
      </AdminLayout>
    );
  }

  const teacher = getUserById(cohort.teacherId);
  const course = mockDiscipleshipCourses.find(c => c.id === cohort.courseId);
  const students = mockDiscipleshipStudents.filter(s => s.cohortId === cohort.id);

  const passing = students.filter(s => s.canGraduate);
  const atRisk = students.filter(
    s => s.totalAttendancePercent < cohort.passRequirement.minAttendancePercent ||
      s.averageExamScore < cohort.passRequirement.minExamScore
  );

  const getStudentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'enrolled': return 'bg-gray-100 text-gray-700';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'dropped': return 'bg-gray-100 text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout title={cohort.name}>
      <div className="mb-6">
        <Link href="/admin/discipleship" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Discipleship
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className={`mt-1 px-2 py-1 text-xs font-bold rounded-lg ${levelColors[cohort.level]}`}>
              Level {cohort.level}
            </span>
            <PageHeader
              title={cohort.name}
              subtitle={`${course?.title} • ${teacher?.firstName} ${teacher?.lastName} • ${students.length}/${cohort.maxCapacity} students`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/discipleship/dashboard?cohort=${cohort.id}`}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Teacher View
            </Link>
            {cohort.status === 'active' && passing.length > 0 && (
              <Link
                href={`/admin/discipleship/cohorts/${id}/graduate`}
                className="flex items-center gap-2 px-3 py-2 bg-[#BF0A30] text-white text-sm font-medium rounded-lg hover:bg-[#B00325]"
              >
                <Trophy className="w-4 h-4" />Graduate ({passing.length})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
          <p className="text-sm text-gray-500">Enrolled</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{passing.length}</p>
          <p className="text-sm text-gray-500">Can Graduate</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{atRisk.length}</p>
          <p className="text-sm text-gray-500">At Risk</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{cohort.passRequirement.minAttendancePercent}%</p>
          <p className="text-sm text-gray-500">Min. Attendance</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <Link
          href={`/admin/discipleship/cohorts/${id}/attendance`}
          className="flex items-center gap-2 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/50 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Download className="w-4 h-4 text-[#BF0A30]" />Import Attendance
        </Link>
        <Link
          href={`/admin/discipleship/cohorts/${id}/exams/new`}
          className="flex items-center gap-2 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/50 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Plus className="w-4 h-4 text-[#BF0A30]" />New Exam
        </Link>
        <Link
          href={`/admin/discipleship/cohorts/${id}/students`}
          className="flex items-center gap-2 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/50 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Users className="w-4 h-4 text-[#BF0A30]" />All Students
        </Link>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-[#2D2D2D]">
          <h2 className="font-semibold text-gray-900 dark:text-white">Students</h2>
        </div>
        {students.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-[#252525]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Exam Avg.</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Graduate?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {students.map((student) => {
                const user = getUserById(student.userId);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-[#252525]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {user?.firstName[0]}{user?.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{user?.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-600 dark:text-gray-400">{student.admissionNumber}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#2D2D2D] rounded-full overflow-hidden w-16">
                          <div
                            className={`h-full rounded-full ${student.totalAttendancePercent >= cohort.passRequirement.minAttendancePercent ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${student.totalAttendancePercent}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{student.totalAttendancePercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${student.averageExamScore >= cohort.passRequirement.minExamScore ? 'text-green-600' : 'text-amber-500'}`}>
                        {student.averageExamScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStudentStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {student.canGraduate ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">No students enrolled yet</div>
        )}
      </div>
    </AdminLayout>
  );
}