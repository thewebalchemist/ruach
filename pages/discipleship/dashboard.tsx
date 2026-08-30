import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Users, BookOpen, GraduationCap, Award, ChevronRight, Plus, Upload,
  AlertTriangle, Loader2,
} from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface Cohort {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  status: string;
  enrolled_count: number;
}

interface ActiveStudent {
  id: string;
  cohort_id: string;
  level: number;
}

interface SessionRow {
  id: string;
  cohort_id: string;
}

interface AttendanceRow {
  student_id: string;
  present: boolean;
}

interface RecentRow {
  id: string;
  level: number;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'KDC 1 — Foundations',
  2: 'KDC 2 — Kingdom Life',
  3: 'KDC 3 — Leadership',
};

export default function DiscipleshipDashboardPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [loading,        setLoading]        = useState(true);
  const [cohorts,        setCohorts]        = useState<Cohort[]>([]);
  const [atRiskCount,    setAtRiskCount]    = useState(0);
  const [graduatesCount, setGraduatesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/discipleship'); return; }
    if (!['teacher', 'admin', 'pastor', 'leader'].includes(profile.role)) {
      router.push('/discipleship/student');
      return;
    }
    load();
  }, [authLoading, profile]);

  async function load() {
    setLoading(true);
    const [
      { data: cohortData },
      { data: activeStudents },
      { count: gradCount },
      { data: recent },
    ] = await Promise.all([
      db.from('discipleship_cohorts')
        .select('id, name, level, status, enrolled_count')
        .order('level'),
      db.from('discipleship_students')
        .select('id, cohort_id, level')
        .in('status', ['enrolled', 'in-progress']),
      supabase.from('discipleship_students')
        .select('id', { count: 'exact', head: true })
        .in('status', ['graduated', 'completed']),
      db.from('discipleship_students')
        .select('id, level, status, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

    const allCohorts = (cohortData ?? []) as Cohort[];
    const activeStu  = (activeStudents ?? []) as ActiveStudent[];

    setCohorts(allCohorts);
    setGraduatesCount(gradCount ?? 0);
    setRecentActivity((recent ?? []) as RecentRow[]);

    // At-risk calculation: fetch sessions + attendance for active students
    const activeCohortIds = [...new Set(activeStu.map(s => s.cohort_id))];
    const activeStudentIds = activeStu.map(s => s.id);

    if (activeCohortIds.length > 0 && activeStudentIds.length > 0) {
      const [{ data: sessionData }, { data: attData }] = await Promise.all([
        db.from('discipleship_sessions')
          .select('id, cohort_id')
          .in('cohort_id', activeCohortIds)
          .eq('is_completed', true),
        db.from('discipleship_attendance')
          .select('student_id, present')
          .in('student_id', activeStudentIds),
      ]);

      const sessions    = (sessionData ?? []) as SessionRow[];
      const attendance  = (attData ?? []) as AttendanceRow[];

      const atRisk = activeStu.filter(student => {
        const cohortSessions = sessions.filter(s => s.cohort_id === student.cohort_id).length;
        if (cohortSessions === 0) return false;
        const attended = attendance.filter(a => a.student_id === student.id && a.present).length;
        return (attended / cohortSessions) * 100 < 80;
      });
      setAtRiskCount(atRisk.length);
    }

    setLoading(false);
  }

  if (loading) return (
    <DiscipleshipLayout title="Dashboard">
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
      </div>
    </DiscipleshipLayout>
  );

  const activeCohorts  = cohorts.filter(c => c.status === 'active');
  const totalEnrolled  = activeCohorts.reduce((s, c) => s + (c.enrolled_count ?? 0), 0);
  const levelGroups    = [1, 2, 3].map(lvl => ({
    level: lvl,
    label: LEVEL_LABELS[lvl],
    activeCohorts: activeCohorts.filter(c => c.level === lvl).length,
    enrolled: activeCohorts.filter(c => c.level === lvl).reduce((s, c) => s + (c.enrolled_count ?? 0), 0),
  }));

  return (
    <DiscipleshipLayout title="Dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discipleship Management</h1>
        <p className="text-gray-500">Track spiritual growth and course progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <div className={`bg-white dark:bg-[#1A1A1A] rounded-xl border p-4 ${atRiskCount > 0 ? 'border-amber-300 dark:border-amber-800' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <AlertTriangle className={`w-5 h-5 mb-2 ${atRiskCount > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
          <p className={`text-2xl font-bold ${atRiskCount > 0 ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>{atRiskCount}</p>
          <p className="text-sm text-gray-500">At Risk</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Award className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{graduatesCount}</p>
          <p className="text-sm text-gray-500">Graduates</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { href: '/discipleship/cohorts?new=1', icon: Plus,   bg: 'bg-[#BF0A30]/10', ic: 'text-[#BF0A30]',  label: 'New Cohort' },
          { href: '/discipleship/students',    icon: Users,  bg: 'bg-purple-100 dark:bg-purple-900/30', ic: 'text-purple-600', label: 'Students' },
          { href: '/discipleship/exams/new',   icon: BookOpen, bg: 'bg-green-100 dark:bg-green-900/30', ic: 'text-green-600', label: 'Create Exam' },
          { href: '/discipleship/graduates',   icon: Award,  bg: 'bg-amber-100 dark:bg-amber-900/30',  ic: 'text-amber-600', label: 'Graduates' },
        ].map(({ href, icon: Icon, bg, ic, label }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors text-center">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${ic}`} />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Levels Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Discipleship Levels</h2>
              <Link href="/discipleship/cohorts" className="text-sm text-[#BF0A30] hover:underline">View Cohorts</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {levelGroups.map(({ level, label, activeCohorts: ac, enrolled }) => (
                <Link key={level} href={`/discipleship/cohorts?level=${level}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-[#BF0A30] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                    L{level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-sm text-gray-500">{ac} active cohort{ac !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white">{enrolled}</p>
                    <p className="text-xs text-gray-500">enrolled</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
              {cohorts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No cohorts yet. Create one to get started.</p>
              )}
            </div>
          </div>

          {/* At-Risk Alert */}
          {atRiskCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Students At Risk</h3>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                {atRiskCount} student{atRiskCount !== 1 ? 's have' : ' has'} attendance below 80%.
              </p>
              <Link href="/discipleship/students?filter=at-risk"
                className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                View At-Risk Students
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Cohorts */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Active Cohorts</h2>
            {activeCohorts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No active cohorts</p>
            ) : (
              <div className="space-y-3">
                {activeCohorts.slice(0, 5).map(cohort => (
                  <Link key={cohort.id} href="/discipleship/cohorts"
                    className="block p-3 bg-gray-50 dark:bg-[#252525] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2D2D] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{cohort.name}</p>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0 ml-2">Active</span>
                    </div>
                    <p className="text-xs text-gray-500">KDC {cohort.level} • {cohort.enrolled_count ?? 0} students</p>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/discipleship/cohorts" className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">
              View All Cohorts
            </Link>
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Enrollments</h2>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map(row => (
                  <div key={row.id} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      row.status === 'graduated' || row.status === 'completed' ? 'bg-green-500' :
                      row.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white truncate">
                        {row.profiles?.full_name ?? 'Unknown student'}
                      </p>
                      <p className="text-xs text-gray-500">
                        KDC {row.level} • {new Date(row.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Graduates Banner */}
          <div className="bg-gradient-to-br from-[#BF0A30] to-[#8B0000] rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-2">Total Graduates</h3>
            <p className="text-4xl font-bold mb-1">{graduatesCount}</p>
            <p className="text-sm text-white/70 mb-4">Across all 3 levels</p>
            <Link href="/discipleship/graduates"
              className="block text-center py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              View Graduates
            </Link>
          </div>
        </div>
      </div>
    </DiscipleshipLayout>
  );
}
