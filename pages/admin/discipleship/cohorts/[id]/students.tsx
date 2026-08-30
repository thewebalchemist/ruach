import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Cohort { id: string; name: string; min_attendance_percent: number; min_exam_score: number }
interface Student {
  id: string; user_id: string; admission_number: string; status: string;
  total_attendance_percent: number; average_exam_score: number;
  profiles: { first_name: string; last_name: string; phone: string | null; member_id: string | null } | null;
}

export default function CohortStudentsPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [cohortRes, studentsRes] = await Promise.all([
      supabase.from('discipleship_cohorts').select('id, name, min_attendance_percent, min_exam_score').eq('id', id).single(),
      supabase.from('discipleship_students').select('id, user_id, admission_number, status, total_attendance_percent, average_exam_score, profiles(first_name, last_name, phone, member_id)').eq('cohort_id', id).order('admission_number'),
    ]);
    setCohort(cohortRes.data ?? null);
    setStudents((studentsRes.data as any) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(s => {
    const name = `${s.profiles?.first_name ?? ''} ${s.profiles?.last_name ?? ''} ${s.admission_number}`;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
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
    <AdminLayout title="Cohort Students">
      <Link href={`/admin/discipleship/cohorts/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />Back to Cohort
      </Link>
      <PageHeader title={cohort ? `${cohort.name} — Students` : 'Students'} subtitle={`${students.length} enrolled`} />

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {filtered.map(student => (
            <Link key={student.id} href={`/admin/members/${student.user_id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                  {student.profiles?.first_name?.[0]}{student.profiles?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{student.profiles?.first_name} {student.profiles?.last_name}</p>
                  <p className="text-sm text-gray-500">{student.admission_number} • {student.profiles?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{student.total_attendance_percent}% att.</p>
                  <p className="text-xs text-gray-500">{student.average_exam_score}% exams</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(student.status)}`}>{student.status}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="p-12 text-center text-gray-500">No students found</div>}
        </div>
        )}
      </div>
    </AdminLayout>
  );
}
