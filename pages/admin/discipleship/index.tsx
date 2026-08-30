import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, BookOpen, CheckCircle, Clock, GraduationCap, Layers, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { DiscipleshipLevel } from '@/types';

interface Course { id: string; level: number; title: string; description: string }
interface Cohort {
  id: string; level: number; name: string; status: string; course_id: string;
  start_date: string; end_date: string; enrolled_count: number; max_capacity: number;
  profiles: { first_name: string; last_name: string } | null;
}
interface Student { id: string; level: number; total_attendance_percent: number; average_exam_score: number; graduated_at: string | null; cohort: { min_attendance_percent: number; min_exam_score: number } | null }

export default function AdminDiscipleshipPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [coursesRes, cohortsRes, studentsRes] = await Promise.all([
      supabase.from('discipleship_courses').select('id, level, title, description').order('level'),
      supabase.from('discipleship_cohorts').select('id, level, name, status, course_id, start_date, end_date, enrolled_count, max_capacity, profiles!teacher_id(first_name, last_name)').order('start_date', { ascending: false }),
      supabase.from('discipleship_students').select('id, level, total_attendance_percent, average_exam_score, graduated_at, cohort:discipleship_cohorts(min_attendance_percent, min_exam_score)'),
    ]);
    setCourses(coursesRes.data ?? []);
    setCohorts((cohortsRes.data as any) ?? []);
    setStudents((studentsRes.data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeCohorts = cohorts.filter(c => c.status === 'active');
  const openCohorts = cohorts.filter(c => c.status === 'registration-open');
  const readyToGraduate = students.filter(s =>
    !s.graduated_at && s.cohort &&
    s.total_attendance_percent >= s.cohort.min_attendance_percent &&
    s.average_exam_score >= s.cohort.min_exam_score
  );

  const levelStats = ([1, 2, 3] as DiscipleshipLevel[]).map(level => ({
    level,
    course: courses.find(c => c.level === level),
    cohorts: cohorts.filter(c => c.level === level),
    students: students.filter(s => s.level === level),
    active: cohorts.filter(c => c.level === level && c.status === 'active').length,
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

  if (loading) {
    return <AdminLayout title="Discipleship"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Discipleship">
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Discipleship (KDC)"
          subtitle="Manage Kingdom Disciples Course cohorts across all 3 levels"
        />
      </div>

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
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
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

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        {levelStats.map(({ level, course, cohorts: lvlCohorts, students: lvlStudents, active }) => (
          <div key={level} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${levelColors[level as DiscipleshipLevel]}`}>
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
              <span className="text-gray-500">{lvlCohorts.length} cohorts • {lvlStudents.length} students</span>
              {active > 0 && (
                <span className="text-green-600 text-xs font-medium">{active} active</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Cohorts</h2>
            <Link href="/discipleship/cohorts" className="text-sm text-[#BF0A30] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {cohorts.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-8 text-center text-gray-500">No cohorts yet</div>
            ) : cohorts.slice(0, 6).map((cohort) => (
              <Link
                key={cohort.id}
                href={`/admin/discipleship/cohorts/${cohort.id}`}
                className="block bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 hover:border-[#BF0A30]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 px-1.5 py-0.5 text-xs font-bold rounded ${levelColors[cohort.level as DiscipleshipLevel]}`}>
                      L{cohort.level}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{cohort.name}</p>
                      <p className="text-sm text-gray-500">
                        {cohort.profiles?.first_name} {cohort.profiles?.last_name} • {cohort.enrolled_count}/{cohort.max_capacity} students
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
                    {new Date(cohort.start_date).toLocaleDateString()} – {new Date(cohort.end_date).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-1">
              <Link
                href="/discipleship/cohorts"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <BookOpen className="w-4 h-4 text-[#BF0A30]" />Create / Manage Cohorts
              </Link>
              <div className="border-t border-gray-100 dark:border-[#2D2D2D] my-2" />
              <Link
                href="/discipleship/enroll"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Users className="w-4 h-4 text-[#BF0A30]" />Enroll Members
              </Link>
              <Link
                href="/discipleship/graduates"
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
