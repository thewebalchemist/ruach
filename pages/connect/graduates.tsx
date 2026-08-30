import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GraduationCap, Search, Award, Download, CheckCircle, Calendar, Users, Loader2 } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';

interface Graduate {
  id: string; user_id: string; admission_number: string; cohort_id: string;
  graduated_at: string | null; certificate_issued: boolean; can_graduate: boolean;
  profiles: { first_name: string; last_name: string; email: string; member_id: string | null } | null;
}
interface Cohort { id: string; name: string; }

export default function GraduatesPage() {
  const [query, setQuery] = useState('');
  const [cohortF, setCohortF] = useState('all');
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [gradsRes, cohortsRes] = await Promise.all([
      supabase.from('connect_students').select('id, user_id, admission_number, cohort_id, graduated_at, certificate_issued, can_graduate, profiles(first_name, last_name, email, member_id)').or('status.eq.completed,certificate_issued.eq.true'),
      supabase.from('connect_cohorts').select('id, name'),
    ]);
    setGraduates((gradsRes.data as any) ?? []);
    setCohorts(cohortsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = graduates.filter(s => {
    const name = `${s.profiles?.first_name ?? ''} ${s.profiles?.last_name ?? ''} ${s.admission_number} ${s.profiles?.member_id ?? ''}`;
    const matchesQ = name.toLowerCase().includes(query.toLowerCase());
    const matchesC = cohortF === 'all' || s.cohort_id === cohortF;
    return matchesQ && matchesC;
  });

  const totalWithCert = graduates.filter(s => s.certificate_issued).length;
  const totalWithMembId = graduates.filter(s => !!s.profiles?.member_id).length;

  async function issueCertificate(studentId: string) {
    setBusyId(studentId);
    await supabase.from('connect_students').update({ certificate_issued: true }).eq('id', studentId);
    await load();
    setBusyId(null);
  }

  async function assignMemberId(studentId: string) {
    setBusyId(studentId);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/admin/graduate-connect-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ studentId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to assign member ID — this action requires admin or pastor access.');
    }
    await load();
    setBusyId(null);
  }

  function exportCsv() {
    const rows = [
      ['Name', 'Admission #', 'Cohort', 'Graduated', 'Member ID', 'Certificate'],
      ...filtered.map(s => [
        `${s.profiles?.first_name ?? ''} ${s.profiles?.last_name ?? ''}`.trim(),
        s.admission_number,
        cohorts.find(c => c.id === s.cohort_id)?.name ?? '',
        s.graduated_at ? new Date(s.graduated_at).toLocaleDateString() : '',
        s.profiles?.member_id ?? '',
        s.certificate_issued ? 'Issued' : 'Pending',
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connect-graduates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ConnectLayout title="Graduates">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Graduates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{graduates.length} total graduates</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Users,       val: graduates.length,     label: 'Total Graduates',    color: 'text-white', bg: 'bg-gray-100' },
          { icon: Award,       val: totalWithCert,        label: 'Certificates Issued', color: 'text-purple-600',              bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { icon: CheckCircle, val: totalWithMembId,      label: 'Member IDs Assigned', color: 'text-green-600',              bg: 'bg-green-100 dark:bg-green-900/30' },
        ].map(({ icon: Icon, val, label, color, bg }) => (
          <div key={label} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-4 shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search graduates..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
          />
        </div>
        <select
          value={cohortF}
          onChange={e => setCohortF(e.target.value)}
          className="px-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
        >
          <option value="all">All Cohorts</option>
          {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-16 text-center shadow-sm">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No graduates found</p>
          <p className="text-sm text-gray-400 mt-1">Graduates appear here once they complete Connect Class</p>
        </div>
      ) : (
        <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Graduate', 'Admission #', 'Cohort', 'Graduated', 'Member ID', 'Certificate', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const cohort = cohorts.find(c => c.id === student.cohort_id);
                  const first = student.profiles?.first_name ?? '';
                  const last  = student.profiles?.last_name ?? '';
                  const busy = busyId === student.id;
                  return (
                    <tr key={student.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {first[0]}{last[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{first} {last}</p>
                            <p className="text-xs text-gray-400">{student.profiles?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{student.admission_number}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{cohort?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          <Calendar className="w-3.5 h-3.5" />
                          {student.graduated_at ? new Date(student.graduated_at).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {student.profiles?.member_id ? (
                          <span className="font-mono text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-lg">
                            {student.profiles.member_id}
                          </span>
                        ) : student.can_graduate ? (
                          <button onClick={() => assignMemberId(student.id)} disabled={busy} className="text-xs text-[#BF0A30] hover:underline font-medium disabled:opacity-50">
                            {busy ? 'Assigning…' : 'Assign ID'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Not eligible</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {student.certificate_issued ? (
                          <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Issued
                          </span>
                        ) : (
                          <button onClick={() => issueCertificate(student.id)} disabled={busy} className="flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium disabled:opacity-50">
                            <Award className="w-3.5 h-3.5" /> {busy ? 'Issuing…' : 'Issue'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/connect/students/${student.id}`} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg inline-block">
                          <GraduationCap className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ConnectLayout>
  );
}
