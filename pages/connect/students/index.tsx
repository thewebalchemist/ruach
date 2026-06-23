import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Eye, AlertTriangle, X, Send, Loader2 } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

const db = supabase as any;

export default function StudentsPage() {
  const router = useRouter();
  const { profile: authUser } = useAuth();
  const initFilter = router.query.filter === 'at-risk' ? 'at-risk' : 'all';

  const [students,   setStudents]   = useState<any[]>([]);
  const [cohorts,    setCohorts]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState('');
  const [cohortF,    setCohortF]    = useState('all');
  const [statusF,    setStatusF]    = useState<'all' | 'at-risk' | 'in-progress' | 'completed'>(initFilter as any);
  const [warnId,     setWarnId]     = useState<string | null>(null);
  const [warnMsg,    setWarnMsg]    = useState('');

  useEffect(() => {
    if (!authUser) return;
    async function load() {
      setLoading(true);
      const [studentsRes, cohortsRes] = await Promise.all([
        db.from('connect_students').select('*, profiles(first_name, last_name, full_name, email, phone), connect_cohorts(name)').order('created_at', { ascending: false }),
        db.from('connect_cohorts').select('id, name'),
      ]);
      if (studentsRes.data) setStudents(studentsRes.data);
      if (cohortsRes.data) setCohorts(cohortsRes.data);
      setLoading(false);
    }
    load();
  }, [authUser]);

  if (loading) {
    return (
      <ConnectLayout title="Students">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
        </div>
      </ConnectLayout>
    );
  }

  const filtered = students.filter(s => {
    const matchQ = `${s.profiles?.full_name ?? ''} ${s.admission_number ?? ''}`.toLowerCase().includes(query.toLowerCase());
    const matchC = cohortF === 'all' || s.cohort_id === cohortF;
    const matchS =
      statusF === 'all'         ? true :
      statusF === 'at-risk'     ? s.total_attendance_percent < 80 :
      statusF === 'in-progress' ? s.status === 'in-progress' :
      statusF === 'completed'   ? s.status === 'completed' : true;
    return matchQ && matchC && matchS;
  });

  const atRiskCount = students.filter(s => s.total_attendance_percent < 80).length;

  return (
    <ConnectLayout title="Students">

      {/* Warn modal */}
      {warnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Send Warning</h3>
              <button onClick={() => setWarnId(null)} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <textarea value={warnMsg} onChange={e => setWarnMsg(e.target.value)} rows={4} placeholder="Warning message to student..." className="w-full px-4 py-3 border border-white/[0.06] rounded-xl bg-[#0A0C10] dark:bg-white/[0.03] text-sm mb-4 resize-none focus:outline-none focus:border-amber-500 text-white placeholder:text-gray-400" />
            <div className="flex gap-3">
              <button onClick={() => setWarnId(null)} className="flex-1 py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium text-white/50">Cancel</button>
              <button onClick={() => { setWarnId(null); setWarnMsg(''); }} disabled={!warnMsg.trim()} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-amber-600 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{students.length} enrolled · {atRiskCount} at risk</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or admission number..." value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]" />
        </div>
        <select value={cohortF} onChange={e => setCohortF(e.target.value)} className="px-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]">
          <option value="all">All Cohorts</option>
          {cohorts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-1 bg-[#12151C] border border-white/[0.06]/70 p-1 rounded-xl">
          {(['all', 'at-risk', 'in-progress', 'completed'] as const).map(s => (
            <button key={s} onClick={() => setStatusF(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${statusF === s ? 'bg-[#BF0A30] text-white' : 'text-gray-500 hover:text-white/70 dark:hover:text-gray-300'}`}>
              {s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Student', 'Admission #', 'Cohort', 'Attendance', 'Exam Avg', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => {
                const risk = student.total_attendance_percent < 80;
                return (
                  <tr key={student.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${risk ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {student.profiles?.first_name?.[0] ?? ''}{student.profiles?.last_name?.[0] ?? ''}
                        </div>
                        <div>
                          <p className="font-medium text-white">{student.profiles?.full_name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{student.profiles?.phone ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/50">{student.admission_number}</td>
                    <td className="px-4 py-3 text-xs text-white/50">{student.connect_cohorts?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${risk ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${student.total_attendance_percent}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${risk ? 'text-red-600' : 'text-green-600'}`}>{student.total_attendance_percent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">{student.average_exam_score > 0 ? `${student.average_exam_score}%` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        student.status === 'completed'   ? 'bg-green-100 text-green-800' :
                        student.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        student.status === 'failed'      ? 'bg-red-100 text-red-800' :
                        'bg-white/5 text-gray-700'
                      }`}>{student.status.replace('-', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {risk && (
                          <button onClick={() => setWarnId(student.id)} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg" title="Send warning">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link href={`/connect/students/${student.id}`} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>No students found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ConnectLayout>
  );
}
