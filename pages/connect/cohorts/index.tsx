import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Users, Calendar, Lock, ChevronRight, Search, Loader2 } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';

type CohortStatus = 'active' | 'registration-open' | 'completed' | 'draft' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  'active':            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'registration-open': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'completed':         'bg-white/5 text-white/50 dark:bg-gray-800',
  'draft':             'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'cancelled':         'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface Cohort {
  id: string; name: string; status: CohortStatus;
  start_date: string; end_date: string; registration_deadline: string;
  enrolled_count: number; max_capacity: number;
  profiles: { first_name: string; last_name: string } | null;
}
interface StudentRow { cohort_id: string; can_graduate: boolean }

export default function CohortsPage() {
  const [cohorts,  setCohorts]  = useState<Cohort[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<CohortStatus | 'all'>('all');
  const [query,    setQuery]    = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: cohortData }, { data: studentData }] = await Promise.all([
      (supabase as any).from('connect_cohorts')
        .select('id, name, status, start_date, end_date, registration_deadline, enrolled_count, max_capacity, profiles!teacher_id(first_name, last_name)')
        .order('start_date', { ascending: false }),
      (supabase as any).from('connect_students').select('cohort_id, can_graduate'),
    ]);
    setCohorts((cohortData ?? []) as Cohort[]);
    setStudents((studentData ?? []) as StudentRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const closeEnrollment = async (id: string) => {
    setCohorts(prev => prev.map(c => c.id === id ? { ...c, status: 'active' } : c));
    await supabase.from('connect_cohorts').update({ status: 'active' }).eq('id', id);
  };

  const filtered = cohorts
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <ConnectLayout title="Cohorts">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Cohorts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cohorts.length} total</p>
        </div>
        <Link
          href="/connect/cohorts/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-xl hover:bg-[#A0021F] shadow-md shadow-[#BF0A30]/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Cohort
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cohorts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
          />
        </div>
        <div className="flex gap-1 bg-[#12151C] border border-white/[0.06]/70 p-1 rounded-xl">
          {(['all', 'active', 'registration-open', 'completed', 'draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                filter === s
                  ? 'bg-[#BF0A30] text-white shadow-sm'
                  : 'text-gray-500 hover:text-white/70 dark:hover:text-gray-300'
              }`}
            >
              {s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-3">
        {filtered.map(cohort => {
          const canGraduate = students.filter(s => s.cohort_id === cohort.id && s.can_graduate).length;
          const fillPct     = cohort.max_capacity > 0 ? Math.round((cohort.enrolled_count / cohort.max_capacity) * 100) : 0;

          return (
            <div key={cohort.id} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">
              <div className="p-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-white truncate">{cohort.name}</h2>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 capitalize ${STATUS_COLORS[cohort.status] ?? 'bg-white/5 text-gray-700'}`}>
                        {cohort.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {cohort.profiles?.first_name} {cohort.profiles?.last_name}
                      {' · '}
                      {new Date(cohort.start_date).toLocaleDateString()} – {new Date(cohort.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/connect/cohorts/${cohort.id}`}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 border border-white/[0.06] rounded-xl text-xs font-medium text-white/50 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors"
                  >
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Enrollment bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {cohort.enrolled_count}/{cohort.max_capacity} enrolled
                    </span>
                    <span>{fillPct}% full</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Reg. deadline {new Date(cohort.registration_deadline).toLocaleDateString()}
                    </span>
                    {canGraduate > 0 && (
                      <span className="text-green-600 font-medium">{canGraduate} ready to graduate</span>
                    )}
                  </div>

                  {cohort.status === 'registration-open' && (
                    <button
                      onClick={() => closeEnrollment(cohort.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" /> Close Enrollment
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-16 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No cohorts found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different filter or create a new cohort</p>
          </div>
        )}
      </div>
      )}
    </ConnectLayout>
  );
}
