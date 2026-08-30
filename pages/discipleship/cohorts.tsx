import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Users, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type CohortStatus = 'draft' | 'active' | 'registration-open' | 'completed';

const statusConfig: Record<string, { label: string; color: string }> = {
  draft:               { label: 'Draft',              color: 'bg-gray-100 text-gray-700' },
  active:              { label: 'Active',              color: 'bg-green-100 text-green-800' },
  'registration-open': { label: 'Registration Open',   color: 'bg-blue-100 text-blue-800' },
  completed:           { label: 'Completed',           color: 'bg-gray-100 text-gray-700' },
};

interface Cohort {
  id: string; level: number; name: string; status: CohortStatus; course_id: string;
  start_date: string; end_date: string; schedule: string; enrolled_count: number; max_capacity: number;
  teacher_id: string | null;
}
interface Course { id: string; level: number; title: string; }
interface Teacher { id: string; first_name: string; last_name: string; }

export default function DiscipleshipCohortsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<CohortStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);

  // dashboard.tsx's "New Cohort" quick-action links here with ?new=1 since
  // this modal is the only cohort-creation UI — there's no separate /new route.
  useEffect(() => {
    if (router.isReady && router.query.new === '1') setShowModal(true);
  }, [router.isReady, router.query.new]);

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newSchedule, setNewSchedule] = useState('Saturdays 2:00 PM - 4:00 PM');
  const [newCapacity, setNewCapacity] = useState(30);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [cohortsRes, coursesRes] = await Promise.all([
      supabase.from('discipleship_cohorts').select('id, level, name, status, course_id, start_date, end_date, schedule, enrolled_count, max_capacity, teacher_id'),
      supabase.from('discipleship_courses').select('id, level, title').order('level'),
    ]);
    setCohorts(cohortsRes.data ?? []);
    setCourses(coursesRes.data ?? []);
    setNewCourseId(prev => prev || coursesRes.data?.[0]?.id || '');

    const teacherIds = [...new Set((cohortsRes.data ?? []).map(c => c.teacher_id).filter(Boolean))] as string[];
    if (teacherIds.length > 0) {
      const { data: teacherRows } = await supabase.from('profiles').select('id, first_name, last_name').in('id', teacherIds);
      setTeachers(teacherRows ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = cohorts.filter(c => {
    const matchesLevel = filterLevel === 'all' || c.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesLevel && matchesStatus;
  });

  const stats = {
    total: cohorts.length,
    active: cohorts.filter(c => c.status === 'active').length,
    open: cohorts.filter(c => c.status === 'registration-open').length,
    enrolled: cohorts.reduce((s, c) => s + c.enrolled_count, 0),
  };

  async function createCohort() {
    if (!newName || !newCourseId || !newStart || !newEnd) { setCreateError('Name, level, and dates are required.'); return; }
    setCreating(true); setCreateError('');
    const course = courses.find(c => c.id === newCourseId);
    const year = new Date(newStart).getFullYear();
    const { error } = await supabase.from('discipleship_cohorts').insert({
      course_id: newCourseId,
      level: course?.level ?? 1,
      name: newName,
      year,
      start_date: newStart,
      end_date: newEnd,
      registration_deadline: newStart,
      schedule: newSchedule,
      teacher_id: profile?.id ?? null,
      max_capacity: newCapacity,
      status: 'registration-open',
    });
    setCreating(false);
    if (error) { setCreateError(error.message); return; }
    setShowModal(false);
    setNewName(''); setNewStart(''); setNewEnd('');
    load();
  }

  return (
    <DiscipleshipLayout title="Cohorts">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Discipleship Cohorts</h1>
          <p className="text-gray-500">{stats.total} cohorts across all levels</p>
        </div>
        <button
          onClick={() => { setCreateError(''); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
        >
          <Plus className="w-4 h-4" />New Cohort
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Cohorts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-gray-500">Open Registration</p>
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Enrolled</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enrolled}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 1, 2, 3] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setFilterLevel(l)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filterLevel === l
                      ? 'bg-[#BF0A30] text-white'
                      : 'border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                >
                  {l === 'all' ? 'All Levels' : `Level ${l}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              className="px-4 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as CohortStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="registration-open">Registration Open</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-4">
        {filtered.map(cohort => {
          const course = courses.find(c => c.id === cohort.course_id);
          const teacher = teachers.find(t => t.id === cohort.teacher_id);
          const cfg = statusConfig[cohort.status] || statusConfig.active;
          const capacity = cohort.max_capacity > 0 ? Math.round((cohort.enrolled_count / cohort.max_capacity) * 100) : 0;

          return (
            <div key={cohort.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 hover:border-[#BF0A30]/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#BF0A30] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    L{cohort.level}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cohort.name}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{course?.title}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(cohort.start_date).toLocaleDateString()} - {new Date(cohort.end_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {cohort.enrolled_count}/{cohort.max_capacity} students
                      </span>
                      {teacher && <span>Teacher: {teacher.first_name} {teacher.last_name}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{cohort.schedule}</p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#2D2D2D] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${capacity >= 90 ? 'bg-red-500' : capacity >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(capacity, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{capacity}% full</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/discipleship/cohorts/${cohort.id}`}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] flex-shrink-0"
                >
                  View<ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center text-gray-500">
            No cohorts found
          </div>
        )}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">New Cohort</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cohort Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. KDC Level 1 - Q2 2026" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                <select value={newCourseId} onChange={e => setNewCourseId(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white">
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>Level {c.level} - {c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule</label>
                <input type="text" value={newSchedule} onChange={e => setNewSchedule(e.target.value)} placeholder="e.g. Saturdays 2:00 PM - 4:00 PM" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Capacity</label>
                <input type="number" value={newCapacity} onChange={e => setNewCapacity(Number(e.target.value))} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" />
              </div>
              {createError && <div className="alert alert-error text-sm">{createError}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">Cancel</button>
              <button onClick={createCohort} disabled={creating} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Cohort'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DiscipleshipLayout>
  );
}
