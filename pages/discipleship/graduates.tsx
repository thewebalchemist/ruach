import { useState, useEffect, useCallback } from 'react';
import { Award, Search, Loader2 } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { supabase } from '@/lib/supabase';

interface Graduate {
  id: string; admission_number: string; level: number; total_attendance_percent: number;
  average_exam_score: number; certificate_issued: boolean; cohort_id: string;
  profiles: { first_name: string; last_name: string } | null;
}
interface Cohort { id: string; name: string; }

export default function DiscipleshipGraduatesPage() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [gradsRes, cohortsRes] = await Promise.all([
      supabase.from('discipleship_students').select('id, admission_number, level, total_attendance_percent, average_exam_score, certificate_issued, cohort_id, profiles(first_name, last_name)').eq('status', 'completed'),
      supabase.from('discipleship_cohorts').select('id, name'),
    ]);
    setGraduates((gradsRes.data as any) ?? []);
    setCohorts(cohortsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = graduates.filter(s => {
    const name = `${s.profiles?.first_name ?? ''} ${s.profiles?.last_name ?? ''}`;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || s.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    total: graduates.length,
    certified: graduates.filter(s => s.certificate_issued).length,
    level1: graduates.filter(s => s.level === 1).length,
    level2: graduates.filter(s => s.level === 2).length,
    level3: graduates.filter(s => s.level === 3).length,
  };

  async function issueCertificate(id: string) {
    setIssuingId(id);
    await supabase.from('discipleship_students').update({ certificate_issued: true }).eq('id', id);
    await load();
    setIssuingId(null);
  }

  return (
    <DiscipleshipLayout title="Graduates">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Graduates</h1>
          <p className="text-gray-500">Students who have completed KDC levels</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">{stats.total} Total Graduates</h2>
            <p className="text-white/70 text-sm">{stats.certified} certificates issued</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xl font-bold">{stats.level1}</p>
            <p className="text-white/70 text-sm">Level 1</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.level2}</p>
            <p className="text-white/70 text-sm">Level 2</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.level3}</p>
            <p className="text-white/70 text-sm">Level 3</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search graduates..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 1, 2, 3] as const).map(l => (
              <button
                key={l}
                onClick={() => setFilterLevel(l)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterLevel === l
                    ? 'bg-[#BF0A30] text-white'
                    : 'border border-white/10 dark:border-[#2D2D2D] text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                {l === 'all' ? 'All Levels' : `Level ${l}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {filtered.map(student => {
            const first = student.profiles?.first_name ?? '';
            const last  = student.profiles?.last_name ?? '';
            const cohort = cohorts.find(c => c.id === student.cohort_id);
            const isIssuing = issuingId === student.id;

            return (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#8B0000] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {first ? `${first[0]}${last[0]}` : 'KD'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white">{first ? `${first} ${last}` : 'Unknown Member'}</p>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Level {student.level} Graduate</span>
                      {student.certificate_issued && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Award className="w-3.5 h-3.5" />Certified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{student.admission_number} &bull; {cohort?.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>Attendance: <span className="text-green-600 font-medium">{student.total_attendance_percent}%</span></span>
                      {student.average_exam_score > 0 && (
                        <span>Exam: <span className="text-green-600 font-medium">{student.average_exam_score}%</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {student.certificate_issued ? (
                    <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                      <Award className="w-3.5 h-3.5" /> Certificate Issued
                    </span>
                  ) : (
                    <button
                      onClick={() => issueCertificate(student.id)}
                      disabled={isIssuing}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-60"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {isIssuing ? 'Issuing...' : 'Issue Certificate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">No graduates found</div>
        )}
      </div>
    </DiscipleshipLayout>
  );
}
