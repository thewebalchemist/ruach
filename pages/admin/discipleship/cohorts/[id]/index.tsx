import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Users, CheckCircle, AlertCircle,
  Download, Plus, Trophy, Loader2,
} from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { DiscipleshipLevel } from '@/types';

const levelColors: Record<DiscipleshipLevel, string> = {
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-purple-100 text-purple-800',
  3: 'bg-[#BF0A30]/10 text-[#BF0A30]',
};

interface Cohort {
  id: string; name: string; level: DiscipleshipLevel; status: string; max_capacity: number;
  min_attendance_percent: number; min_exam_score: number;
  discipleship_courses: { title: string } | null;
  profiles: { first_name: string; last_name: string } | null;
}
interface Student {
  id: string; admission_number: string; status: string;
  total_attendance_percent: number; average_exam_score: number; graduated_at: string | null;
  profiles: { first_name: string; last_name: string; member_id: string | null } | null;
}

export default function AdminDiscipleshipCohortPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [cohortRes, studentsRes] = await Promise.all([
      supabase.from('discipleship_cohorts').select('id, name, level, status, max_capacity, min_attendance_percent, min_exam_score, discipleship_courses(title), profiles!teacher_id(first_name, last_name)').eq('id', id).single(),
      supabase.from('discipleship_students').select('id, admission_number, status, total_attendance_percent, average_exam_score, graduated_at, profiles(first_name, last_name, member_id)').eq('cohort_id', id),
    ]);
    setCohort((cohortRes.data as any) ?? null);
    setStudents((studentsRes.data as any) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <AdminLayout title="Cohort"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  if (!cohort) {
    return (
      <AdminLayout title="Not Found">
        <p className="text-gray-500">Cohort not found</p>
      </AdminLayout>
    );
  }

  const passing = students.filter(s =>
    !s.graduated_at &&
    s.total_attendance_percent >= cohort.min_attendance_percent &&
    s.average_exam_score >= cohort.min_exam_score
  );
  const atRisk = students.filter(
    s => s.total_attendance_percent < cohort.min_attendance_percent || s.average_exam_score < cohort.min_exam_score
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
              subtitle={`${cohort.discipleship_courses?.title ?? ''} • ${cohort.profiles?.first_name ?? ''} ${cohort.profiles?.last_name ?? ''} • ${students.length}/${cohort.max_capacity} students`}
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
          <p className="text-2xl font-bold text-blue-600">{cohort.min_attendance_percent}%</p>
          <p className="text-sm text-gray-500">Min. Attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <Link
          href={`/admin/discipleship/cohorts/${id}/attendance`}
          className="flex items-center gap-2 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/50 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Download className="w-4 h-4 text-[#BF0A30]" />Import Attendance
        </Link>
        <Link
          href={`/discipleship/exams/new?cohort=${id}`}
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
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-[#252525]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {student.profiles?.first_name} {student.profiles?.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{student.profiles?.member_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-gray-600 dark:text-gray-400">{student.admission_number}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#2D2D2D] rounded-full overflow-hidden w-16">
                        <div
                          className={`h-full rounded-full ${student.total_attendance_percent >= cohort.min_attendance_percent ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${student.total_attendance_percent}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{student.total_attendance_percent}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${student.average_exam_score >= cohort.min_exam_score ? 'text-green-600' : 'text-amber-500'}`}>
                      {student.average_exam_score}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStudentStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {passing.some(p => p.id === student.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">No students enrolled yet</div>
        )}
      </div>
    </AdminLayout>
  );
}
