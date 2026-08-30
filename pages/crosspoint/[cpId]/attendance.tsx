import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Plus, Check, X, Loader2, Save } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { useCrosspoint } from '@/hooks/useCrosspoint';
import { supabase } from '@/lib/supabase';

interface Member { user_id: string; profiles: { first_name: string; last_name: string } | null }
interface AttendanceRecord { user_id: string; meeting_date: string; present: boolean }

export default function CrosspointAttendancePage() {
  const router = useRouter();
  const { cpId } = router.query as { cpId?: string };
  const { crosspoint, loading: cpLoading } = useCrosspoint(cpId);

  const [members, setMembers] = useState<Member[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);
  const [todayPresent, setTodayPresent] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!cpId) return;
    setLoading(true);
    const [membersRes, recordsRes] = await Promise.all([
      supabase.from('crosspoint_memberships').select('user_id, profiles(first_name, last_name)').eq('crosspoint_id', cpId).eq('status', 'active'),
      supabase.from('crosspoint_attendance').select('user_id, meeting_date, present').eq('crosspoint_id', cpId).order('meeting_date', { ascending: false }),
    ]);
    setMembers((membersRes.data as any) ?? []);
    setRecords(recordsRes.data ?? []);
    setLoading(false);
  }, [cpId]);

  useEffect(() => { load(); }, [load]);

  const byDate = records.reduce<Record<string, AttendanceRecord[]>>((acc, r) => {
    (acc[r.meeting_date] ??= []).push(r);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  const totalPresent = records.filter(r => r.present).length;
  const avgAttendance = dates.length > 0 ? totalPresent / dates.length : 0;
  const avgPercentage = members.length > 0 ? Math.round((avgAttendance / members.length) * 100) : 0;

  function memberName(userId: string) {
    const m = members.find(m => m.user_id === userId);
    return m ? `${m.profiles?.first_name ?? ''} ${m.profiles?.last_name ?? ''}`.trim() : 'Unknown';
  }

  async function saveTodayAttendance() {
    if (!cpId) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('crosspoint_attendance').upsert(
      members.map(m => ({
        crosspoint_id: cpId,
        user_id: m.user_id,
        meeting_date: today,
        present: todayPresent.has(m.user_id),
        marked_by: session?.user.id ?? null,
      })),
      { onConflict: 'crosspoint_id,user_id,meeting_date' },
    );
    setSaving(false);
    setTaking(false);
    setTodayPresent(new Set());
    load();
  }

  if (cpLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Attendance">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-500">Track weekly meeting attendance</p>
        </div>
        <button onClick={() => setTaking(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />Take Attendance
        </button>
      </div>

      {taking && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Today's Attendance</h2>
          <p className="text-sm text-gray-500 mb-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
            {members.map(m => {
              const checked = todayPresent.has(m.user_id);
              return (
                <label key={m.user_id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={() => {
                    setTodayPresent(prev => {
                      const next = new Set(prev);
                      checked ? next.delete(m.user_id) : next.add(m.user_id);
                      return next;
                    });
                  }} />
                  <span className="text-sm text-gray-800 dark:text-gray-200">{m.profiles?.first_name} {m.profiles?.last_name}</span>
                </label>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setTaking(false); setTodayPresent(new Set()); }} className="flex-1 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={saveTodayAttendance} disabled={saving} className="flex-1 py-2.5 bg-[#BF0A30] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : `Save (${todayPresent.size}/${members.length} present)`}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Avg. Attendance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgAttendance)}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className="text-2xl font-bold text-green-600">{avgPercentage}%</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Records</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{dates.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
        <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
          <h2 className="font-semibold text-gray-900 dark:text-white">Attendance History</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : dates.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No attendance recorded yet</div>
        ) : (
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {dates.map(date => {
            const dayRecords = byDate[date];
            const present = dayRecords.filter(r => r.present);
            const absent = dayRecords.filter(r => !r.present);
            const percentage = dayRecords.length > 0 ? Math.round((present.length / dayRecords.length) * 100) : 0;
            const isExpanded = expandedDate === date;

            return (
              <div key={date}>
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/10 flex flex-col items-center justify-center">
                      <p className="text-xs text-[#BF0A30] font-medium">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-lg font-bold text-[#BF0A30]">{new Date(date).getDate()}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                      <p className="text-sm text-gray-500">{present.length} present • {absent.length} absent</p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {percentage}%
                  </p>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                          <Check className="w-4 h-4" />Present ({present.length})
                        </p>
                        <div className="space-y-2">
                          {present.map(r => (
                            <div key={r.user_id} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                                {memberName(r.user_id)[0]}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{memberName(r.user_id)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                          <X className="w-4 h-4" />Absent ({absent.length})
                        </p>
                        <div className="space-y-2">
                          {absent.length > 0 ? absent.map(r => (
                            <div key={r.user_id} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                                {memberName(r.user_id)[0]}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{memberName(r.user_id)}</span>
                            </div>
                          )) : (
                            <p className="text-sm text-gray-500">Everyone was present! 🎉</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </CrosspointLayout>
  );
}
