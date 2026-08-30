import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Users, Calendar, BookOpen, ClipboardList, ChevronRight, TrendingUp, Home, MapPin, Clock, Loader2 } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { supabase } from '@/lib/supabase';
import type { Crosspoint } from '@/types';

interface Member { user_id: string; role: string; profiles: { first_name: string; last_name: string; phone: string | null } | null }
interface AttendanceDay { meeting_date: string; present: number; total: number }
interface CurrentModule { weekNumber: number; title: string; scripture: string | null; totalWeeks: number }

export default function CrosspointDashboardPage() {
  const router = useRouter();
  const { cpId } = router.query as { cpId?: string };

  const [crosspoint, setCrosspoint] = useState<Crosspoint | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceDay[]>([]);
  const [currentModule, setCurrentModule] = useState<CurrentModule | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cpId) return;
    setLoading(true);
    const { data: cp } = await supabase
      .from('crosspoints')
      .select('id, name, zone, area, location, status, max_members, member_count, leader_id, assistant_id, treasurer_id, meeting_day, meeting_time, venue, created_at')
      .eq('id', cpId)
      .single();

    if (cp) {
      setCrosspoint({
        id: cp.id, name: cp.name, zone: cp.zone, area: cp.area, location: cp.location,
        status: cp.status, maxMembers: cp.max_members, memberCount: cp.member_count,
        leaderId: cp.leader_id, assistantId: cp.assistant_id, treasurerId: cp.treasurer_id,
        meetingDay: cp.meeting_day, meetingTime: cp.meeting_time, venue: cp.venue, createdAt: cp.created_at,
      } as Crosspoint);

      const [membersRes, progressRes, attendanceRes] = await Promise.all([
        supabase.from('crosspoint_memberships').select('user_id, role, profiles(first_name, last_name, phone)').eq('crosspoint_id', cpId).eq('status', 'active'),
        supabase.from('crosspoint_module_progress').select('current_week, module_id, crosspoint_modules(title, total_weeks)').eq('crosspoint_id', cpId).is('completed_at', null).maybeSingle(),
        supabase.from('crosspoint_attendance').select('meeting_date, present').eq('crosspoint_id', cpId).order('meeting_date', { ascending: false }).limit(30),
      ]);

      setMembers((membersRes.data as any) ?? []);

      if (progressRes.data) {
        const p = progressRes.data as any;
        const { data: week } = await supabase.from('crosspoint_module_weeks').select('title, scripture').eq('module_id', p.module_id).eq('week_number', p.current_week).maybeSingle();
        setCurrentModule({
          weekNumber: p.current_week,
          title: week?.title ?? p.crosspoint_modules?.title ?? '',
          scripture: week?.scripture ?? null,
          totalWeeks: p.crosspoint_modules?.total_weeks ?? 0,
        });
      }

      const byDate = (attendanceRes.data ?? []).reduce<Record<string, { present: number; total: number }>>((acc, r) => {
        const day = acc[r.meeting_date] ??= { present: 0, total: 0 };
        day.total++;
        if (r.present) day.present++;
        return acc;
      }, {});
      setRecentAttendance(Object.entries(byDate).map(([meeting_date, v]) => ({ meeting_date, ...v })).slice(0, 3));
    }
    setLoading(false);
  }, [cpId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!crosspoint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Crosspoint not found</p>
          <Link href="/crosspoint" className="text-[#BF0A30] hover:underline">Select a crosspoint</Link>
        </div>
      </div>
    );
  }

  const leader = members.find(m => m.user_id === crosspoint.leaderId)?.profiles;
  const capacityPct = crosspoint.maxMembers > 0 ? (crosspoint.memberCount / crosspoint.maxMembers) * 100 : 0;
  const avgAttendance = recentAttendance.length > 0
    ? Math.round(recentAttendance.reduce((s, r) => s + (r.total > 0 ? r.present / r.total : 0), 0) / recentAttendance.length * 100)
    : 0;

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Dashboard">
      <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5" />
              <h1 className="text-2xl font-bold">{crosspoint.name}</h1>
            </div>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{crosspoint.area}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{crosspoint.meetingDay}s at {crosspoint.meetingTime}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{crosspoint.memberCount}</p>
            <p className="text-white/70 text-sm">Members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Users className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{crosspoint.memberCount}</p>
          <p className="text-sm text-gray-500">Total Members</p>
          <div className="mt-2 h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(capacityPct, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.max(0, crosspoint.maxMembers - crosspoint.memberCount)} slots available</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <ClipboardList className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentAttendance[0]?.present ?? 0}</p>
          <p className="text-sm text-gray-500">Last Attendance</p>
          {recentAttendance[0] && (
            <p className="text-xs text-green-600 mt-2">{Math.round((recentAttendance[0].present / recentAttendance[0].total) * 100)}% present</p>
          )}
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <BookOpen className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentModule ? `Week ${currentModule.weekNumber}` : '—'}</p>
          <p className="text-sm text-gray-500">Current Module</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <TrendingUp className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentAttendance.length > 0 ? `${avgAttendance}%` : '—'}</p>
          <p className="text-sm text-gray-500">Avg. Attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Link href={`/crosspoint/${cpId}/attendance`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Take Attendance</span>
        </Link>
        <Link href={`/crosspoint/${cpId}/module`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">View Module</span>
        </Link>
        <Link href={`/crosspoint/${cpId}/food-bank`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Food Bank Request</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {currentModule && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#BF0A30]" />This Week's Module
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#BF0A30] text-white">Week {currentModule.weekNumber}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{currentModule.title}</h3>
              {currentModule.scripture && <p className="text-[#BF0A30] font-medium mb-3">{currentModule.scripture}</p>}
              <Link href={`/crosspoint/${cpId}/module`} className="inline-flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
                View Full Module <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Attendance</h2>
              <Link href={`/crosspoint/${cpId}/attendance`} className="text-sm text-[#BF0A30] hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {recentAttendance.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No attendance recorded yet.</p>
              ) : recentAttendance.map((record) => (
                <div key={record.meeting_date} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(record.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm text-gray-500">{record.present} of {record.total} present</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{record.total > 0 ? Math.round((record.present / record.total) * 100) : 0}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Leadership</h2>
            {leader && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg mb-2">
                <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                  {leader.first_name[0]}{leader.last_name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{leader.first_name} {leader.last_name}</p>
                  <p className="text-xs text-gray-500">Leader • {leader.phone}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Members</h2>
            <div className="space-y-2">
              {members.slice(0, 5).map(member => (
                <div key={member.user_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#252525] flex items-center justify-center text-xs font-semibold">
                    {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{member.profiles?.first_name} {member.profiles?.last_name}</p>
                </div>
              ))}
            </div>
            <Link href={`/crosspoint/${cpId}/members`} className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">
              View All {members.length} Members
            </Link>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Meeting Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Day</span>
                <span className="font-medium text-gray-900 dark:text-white">{crosspoint.meetingDay}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900 dark:text-white">{crosspoint.meetingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue</span>
                <span className="font-medium text-gray-900 dark:text-white">{crosspoint.venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CrosspointLayout>
  );
}
