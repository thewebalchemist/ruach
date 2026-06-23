import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Users, CheckCircle, AlertCircle, Download,
  Plus, ClipboardList, Trophy, Loader2
} from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

export default function AdminConnectCohortPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [cohort, setCohort] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/connect'); return; }
    if (!['admin', 'pastor'].includes(profile.role)) {
      router.push('/connect');
      return;
    }
    if (id) load();
  }, [authLoading, profile, id]);

  async function load() {
    setLoading(true);
    const [
      { data: cohortData },
      { data: studentData },
      { data: sessionData },
      { data: examData },
    ] = await Promise.all([
      db.from('connect_cohorts')
        .select('*, profiles!connect_cohorts_teacher_id_fkey(first_name, last_name)')
        .eq('id', id)
        .single(),
      db.from('connect_students')
        .select('*, profiles(first_name, last_name, email, phone)')
        .eq('cohort_id', id),
      db.from('connect_sessions')
        .select('*')
        .eq('cohort_id', id)
        .order('session_number'),
      db.from('connect_exams')
        .select('*')
        .eq('cohort_id', id),
    ]);

    setCohort(cohortData ?? null);
    setStudents(studentData ?? []);
    setSessions(sessionData ?? []);
    setExams(examData ?? []);
    setLoading(false);
  }

  if (loading) return (
    <AdminLayout title="Loading...">
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
      </div>
    </AdminLayout>
  );

  if (!cohort) {
    return (
      <AdminLayout title="Not Found">
        <p className="text-gray-500">Cohort not found</p>
      </AdminLayout>
    );
  }

  const passing = students.filter(s => s.can_graduate);
  const atRisk = students.filter(
    s => s.total_attendance_percent < cohort.min_attendance_percent ||
      s.average_exam_score < cohort.min_exam_score
  );

  const getStudentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'enrolled': return 'bg-white/5 text-gray-700';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'dropped': return 'bg-white/5 text-gray-400';
      default: return 'bg-white/5 text-gray-700';
    }
  };

  return (
    <AdminLayout title={cohort.name}>
      <div className="mb-6">
        <Link href="/admin/connect" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Connect
        </Link>
        <div className="flex items-start justify-between">
          <PageHeader title={cohort.name} subtitle={`${students.length} students • Teacher: ${cohort.profiles?.first_name} ${cohort.profiles?.last_name}`} />
          <div className="flex items-center gap-2">
            <Link
              href={`/connect/dashboard?cohort=${cohort.id}`}
              className="flex items-center gap-2 px-3 py-2 border border-white/10 dark:border-[#2D2D2D] text-white/70 text-sm font-medium rounded-lg hover:bg-white/[0.06]"
            >
              Teacher View
            </Link>
            {cohort.status === 'active' && passing.length > 0 && (
              <Link
                href={`/admin/connect/cohorts/${id}/graduate`}
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
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4 text-center">
          <p className="text-2xl font-bold text-white">{students.length}</p>
          <p className="text-sm text-gray-500">Total Students</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{passing.length}</p>
          <p className="text-sm text-gray-500">Can Graduate</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{atRisk.length}</p>
          <p className="text-sm text-gray-500">At Risk</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
          <p className="text-sm text-gray-500">Sessions</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Link href={`/admin/connect/cohorts/${id}/attendance`} className="flex items-center gap-2 p-3 bg-[#12151C] rounded-xl border border-white/[0.06] hover:border-[#BF0A30]/50 text-sm font-medium text-white/70">
          <Download className="w-4 h-4 text-[#BF0A30]" />Import Attendance
        </Link>
        <Link href={`/admin/connect/cohorts/${id}/exams/new`} className="flex items-center gap-2 p-3 bg-[#12151C] rounded-xl border border-white/[0.06] hover:border-[#BF0A30]/50 text-sm font-medium text-white/70">
          <Plus className="w-4 h-4 text-[#BF0A30]" />New Exam
        </Link>
        <Link href={`/admin/connect/cohorts/${id}/students`} className="flex items-center gap-2 p-3 bg-[#12151C] rounded-xl border border-white/[0.06] hover:border-[#BF0A30]/50 text-sm font-medium text-white/70">
          <Users className="w-4 h-4 text-[#BF0A30]" />All Students
        </Link>
        <Link href={`/admin/connect/legacy`} className="flex items-center gap-2 p-3 bg-[#12151C] rounded-xl border border-white/[0.06] hover:border-[#BF0A30]/50 text-sm font-medium text-white/70">
          <ClipboardList className="w-4 h-4 text-[#BF0A30]" />Legacy Requests
        </Link>
      </div>

      {/* Students Table */}
      <div className="bg-[#12151C] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
          <h2 className="font-semibold text-white">Students</h2>
        </div>
        {students.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-white/[0.04]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Exam Avg.</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Graduate?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {students.map((student) => {
                return (
                  <tr key={student.id} className="hover:bg-white/[0.06]">
                    <td className="py-3 px-4">
                      <Link href={`/admin/connect/students/${student.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {student.profiles?.first_name} {student.profiles?.last_name}
                          </p>
                          <p className="text-xs text-gray-400">{student.profiles?.phone}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-white/50">{student.admission_number}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-16">
                          <div
                            className={`h-full rounded-full ${student.total_attendance_percent >= cohort.min_attendance_percent ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${student.total_attendance_percent}%` }}
                          />
                        </div>
                        <span className="text-sm text-white/50">{student.total_attendance_percent}%</span>
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
                      {student.can_graduate ? (
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
