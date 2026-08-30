import { useState, useEffect, useCallback } from 'react';
import { Search, AlertTriangle, CheckCircle, BookOpen, Loader2 } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { supabase } from '@/lib/supabase';

type StudentStatus = 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';

const statusConfig: Record<string, { label: string; color: string }> = {
  registered:   { label: 'Registered',  color: 'bg-gray-100 text-gray-700' },
  enrolled:     { label: 'Enrolled',    color: 'bg-blue-100 text-blue-800' },
  'in-progress':{ label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  completed:    { label: 'Completed',   color: 'bg-green-100 text-green-800' },
  failed:       { label: 'Failed',      color: 'bg-red-100 text-red-800' },
  dropped:      { label: 'Withdrawn',   color: 'bg-gray-100 text-gray-700' },
};

interface Student {
  id: string; admission_number: string; level: number; status: StudentStatus;
  total_attendance_percent: number; average_exam_score: number; cohort_id: string;
  profiles: { first_name: string; last_name: string } | null;
}
interface Cohort { id: string; name: string; }

export default function DiscipleshipStudentsPage() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'all'>('all');
  const [filterAtRisk, setFilterAtRisk] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts]   = useState<Cohort[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [studentsRes, cohortsRes] = await Promise.all([
      supabase.from('discipleship_students').select('id, admission_number, level, status, total_attendance_percent, average_exam_score, cohort_id, profiles(first_name, last_name)'),
      supabase.from('discipleship_cohorts').select('id, name'),
    ]);
    setStudents((studentsRes.data as any) ?? []);
    setCohorts(cohortsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(s => {
    const name = `${s.profiles?.first_name ?? ''} ${s.profiles?.last_name ?? ''}`;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || s.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesRisk = !filterAtRisk || s.total_attendance_percent < 80;
    return matchesSearch && matchesLevel && matchesStatus && matchesRisk;
  });

  const stats = {
    total: students.length,
    inProgress: students.filter(s => s.status === 'in-progress').length,
    atRisk: students.filter(s => s.total_attendance_percent < 80).length,
    completed: students.filter(s => s.status === 'completed').length,
  };

  return (
    <DiscipleshipLayout title="Students">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">All Students</h1>
          <p className="text-gray-500">{stats.total} students across all cohorts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <BookOpen className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Students</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-amber-200 dark:border-amber-800 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-600">{stats.atRisk}</p>
          <p className="text-sm text-gray-500">At Risk</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-green-200 dark:border-green-800 p-4">
          <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or admission no..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white"
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Levels</option>
            <option value={1}>Level 1</option>
            <option value={2}>Level 2</option>
            <option value={3}>Level 3</option>
          </select>
          <select
            className="px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as StudentStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="dropped">Withdrawn</option>
          </select>
          <button
            onClick={() => setFilterAtRisk(!filterAtRisk)}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2 ${
              filterAtRisk
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-white/10 dark:border-[#2D2D2D] text-white/70 hover:bg-white/[0.06]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />At Risk Only
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-white/[0.04]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Cohort</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Exam Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map(student => {
                const cfg = statusConfig[student.status] || statusConfig['in-progress'];
                const isAtRisk = student.total_attendance_percent < 80;
                const first = student.profiles?.first_name ?? '';
                const last  = student.profiles?.last_name ?? '';
                const cohort = cohorts.find(c => c.id === student.cohort_id);

                return (
                  <tr key={student.id} className={`hover:bg-white/[0.06] ${isAtRisk ? 'border-l-2 border-amber-400' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {first ? `${first[0]}${last[0]}` : student.admission_number.slice(-2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{first ? `${first} ${last}` : 'Unknown Member'}</p>
                          <p className="text-xs text-gray-500">{student.admission_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{cohort?.name || '-'}</p>
                      <p className="text-xs text-gray-500">Level {student.level}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.color}`}>{cfg.label}</span>
                      {isAtRisk && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600">At Risk</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${student.total_attendance_percent >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(student.total_attendance_percent, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${student.total_attendance_percent >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                          {student.total_attendance_percent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {student.average_exam_score > 0 ? (
                        <span className={`text-sm font-medium ${student.average_exam_score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {student.average_exam_score}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">No exam yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">No students found</div>
        )}
      </div>
    </DiscipleshipLayout>
  );
}
