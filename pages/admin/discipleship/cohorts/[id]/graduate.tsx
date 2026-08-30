import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Trophy, CheckCircle, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Cohort { id: string; name: string; level: number; min_attendance_percent: number; min_exam_score: number }
interface Student {
  id: string; status: string; total_attendance_percent: number; average_exam_score: number; graduated_at: string | null;
  profiles: { first_name: string; last_name: string; member_id: string | null } | null;
}

export default function GraduateCohortPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [graduatingId, setGraduatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [cohortRes, studentsRes] = await Promise.all([
      supabase.from('discipleship_cohorts').select('id, name, level, min_attendance_percent, min_exam_score').eq('id', id).single(),
      supabase.from('discipleship_students').select('id, status, total_attendance_percent, average_exam_score, graduated_at, profiles(first_name, last_name, member_id)').eq('cohort_id', id),
    ]);
    setCohort(cohortRes.data);
    setStudents((studentsRes.data as any) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function graduate(studentId: string) {
    setGraduatingId(studentId);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/admin/graduate-discipleship-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ studentId }),
    });
    setGraduatingId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Failed to graduate student.');
      return;
    }
    load();
  }

  if (loading) {
    return <AdminLayout title="Graduate Cohort"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }
  if (!cohort) {
    return <AdminLayout title="Not Found"><p className="text-gray-500">Cohort not found</p></AdminLayout>;
  }

  const eligible = students.filter(s => !s.graduated_at && s.total_attendance_percent >= cohort.min_attendance_percent && s.average_exam_score >= cohort.min_exam_score);
  const graduated = students.filter(s => s.status === 'completed');

  return (
    <AdminLayout title="Graduate Cohort">
      <Link href={`/admin/discipleship/cohorts/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />Back to Cohort
      </Link>
      <PageHeader title={`Graduate — ${cohort.name}`} subtitle={`${eligible.length} students eligible to graduate Level ${cohort.level}`} />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
          <h2 className="font-semibold text-gray-900 dark:text-white">Eligible to Graduate ({eligible.length})</h2>
        </div>
        {eligible.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No students currently meet the minimum attendance ({cohort.min_attendance_percent}%) and exam score ({cohort.min_exam_score}%) requirements.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
            {eligible.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                    {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.profiles?.first_name} {student.profiles?.last_name}</p>
                    <p className="text-sm text-gray-500">{student.total_attendance_percent}% attendance • {student.average_exam_score}% exams</p>
                  </div>
                </div>
                <button onClick={() => graduate(student.id)} disabled={graduatingId === student.id} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
                  <Trophy className="w-4 h-4" />{graduatingId === student.id ? 'Graduating…' : 'Graduate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {graduated.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
          <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
            <h2 className="font-semibold text-gray-900 dark:text-white">Already Graduated ({graduated.length})</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
            {graduated.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                    {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{student.profiles?.first_name} {student.profiles?.last_name}</p>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle className="w-4 h-4" />Graduated</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
