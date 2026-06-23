import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Users, BookOpen, CheckCircle, Clock, GraduationCap, Layers, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DiscipleshipLevel } from '@/types';

const db = supabase as any;

interface CohortRow {
  id: string;
  name: string;
  level: DiscipleshipLevel;
  status: string;
  teacher_id: string | null;
  max_capacity: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface StudentRow {
  id: string;
  cohort_id: string;
  level: DiscipleshipLevel;
  can_graduate: boolean;
  graduated_at: string | null;
}

interface CourseRow {
  id: string;
  title: string;
  description: string;
  level: DiscipleshipLevel;
}

interface TeacherRow {
  id: string;
  first_name: string;
  last_name: string;
}

export default function AdminDiscipleshipPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [teachers, setTeachers] = useState<Record<string, TeacherRow>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setLoading(true);

    // Fetch cohorts
    const { data: cohortData } = await db
      .from('discipleship_cohorts')
      .select('*')
      .order('created_at', { ascending: false });

    const cohortRows = (cohortData ?? []) as CohortRow[];
    setCohorts(cohortRows);

    // Fetch students
    const { data: studentData } = await db
      .from('discipleship_students')
      .select('id, cohort_id, level, can_graduate, graduated_at');

    setStudents((studentData ?? []) as StudentRow[]);

    // Fetch courses
    const { data: courseData } = await db
      .from('discipleship_courses')
      .select('id, title, description, level');

    setCourses((courseData ?? []) as CourseRow[]);

    // Fetch teacher profiles
    const teacherIds = [...new Set(cohortRows.map(c => c.teacher_id).filter(Boolean))] as string[];
    if (teacherIds.length > 0) {
      const { data: profileData } = await db
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', teacherIds);

      const map: Record<string, TeacherRow> = {};
      for (const p of (profileData ?? []) as TeacherRow[]) {
        map[p.id] = p;
      }
      setTeachers(map);
    }

    setLoading(false);
  }

  const activeCohorts = cohorts.filter(c => c.status === 'active');
  const openCohorts = cohorts.filter(c => c.status === 'registration-open');
  const readyToGraduate = students.filter(s => s.can_graduate && !s.graduated_at);

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
      case 'completed': return 'bg-white/5 text-white/70 dark:bg-gray-800';
      case 'draft': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-white/5 text-gray-700';
    }
  };

  const levelColors: Record<DiscipleshipLevel, string> = {
    1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    2: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    3: 'bg-[#BF0A30]/10 text-[#BF0A30] dark:bg-[#BF0A30]/20',
  };

  if (loading) {
    return (
      <AdminLayout title="Discipleship">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

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
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Active Cohorts</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeCohorts.length}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-white">{students.length}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Open for Reg.</span>
          </div>
          <p className="text-2xl font-bold text-white">{openCohorts.length}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#BF0A30]" />
            </div>
            <span className="text-sm text-gray-500">Ready to Graduate</span>
          </div>
          <p className="text-2xl font-bold text-white">{readyToGraduate.length}</p>
        </div>
      </div>

      {/* Level Overview */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        {levelStats.map(({ level, course, cohorts: lvlCohorts, students: lvlStudents, active }) => (
          <div key={level} className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${levelColors[level]}`}>
                  Level {level}
                </span>
              </div>
              <GraduationCap className="w-5 h-5 text-gray-400" />
            </div>
            <p className="font-semibold text-white mb-1">
              {course?.title ?? `KDC Level ${level}`}
            </p>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course?.description}</p>
            <div className="flex items-center justify-between text-sm border-t border-white/[0.04] pt-3">
              <span className="text-gray-500">{lvlCohorts.length} cohorts  {lvlStudents.length} students</span>
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
            <h2 className="text-lg font-semibold text-white">All Cohorts</h2>
            <Link href="/admin/discipleship/cohorts" className="text-sm text-[#BF0A30] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {cohorts.slice(0, 6).map((cohort) => {
              const teacher = cohort.teacher_id ? teachers[cohort.teacher_id] : null;
              const cohortStudents = students.filter(s => s.cohort_id === cohort.id);
              return (
                <Link
                  key={cohort.id}
                  href={`/admin/discipleship/cohorts/${cohort.id}`}
                  className="block bg-[#12151C] rounded-xl border border-white/[0.06] p-4 hover:border-[#BF0A30]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 px-1.5 py-0.5 text-xs font-bold rounded ${levelColors[cohort.level]}`}>
                        L{cohort.level}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{cohort.name}</p>
                        <p className="text-sm text-gray-500">
                          {teacher ? `${teacher.first_name} ${teacher.last_name}` : 'No teacher'} {cohortStudents.length}/{cohort.max_capacity} students
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
                      {new Date(cohort.start_date).toLocaleDateString()} - {new Date(cohort.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {([1, 2, 3] as DiscipleshipLevel[]).map(level => (
                <Link
                  key={level}
                  href={`/admin/discipleship/cohorts/new?level=${level}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.06] text-sm font-medium text-white/70"
                >
                  <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${levelColors[level]}`}>L{level}</span>
                  New Level {level} Cohort
                </Link>
              ))}
              <div className="border-t border-white/[0.04] my-2" />
              <Link
                href="/admin/discipleship/enroll"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.06] text-sm font-medium text-white/70"
              >
                <Users className="w-4 h-4 text-[#BF0A30]" />Enroll Members
              </Link>
              <Link
                href="/admin/discipleship/graduates"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.06] text-sm font-medium text-white/70"
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
