import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, Home, TrendingUp, Calendar, PieChart, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalMembers: number; activeCrosspoints: number; totalGuests: number; upcomingEvents: number;
  memberGrowth: { month: string; count: number }[];
  departmentStats: { name: string; members: number }[];
  crosspointCapacity: { name: string; current: number; max: number }[];
  connectCompletionRate: number; guestRetentionRate: number;
  avgCrosspointSize: number; discipleshipParticipationRate: number; prayerAnsweredRate: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      membersRes, crosspointsRes, guestsRes, eventsRes, allProfilesRes,
      deptMembershipsRes, connectStudentsRes, discStudentsRes, prayerRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).not('member_id', 'is', null),
      supabase.from('crosspoints').select('id, name, status, member_count, max_members'),
      supabase.from('guests').select('id, follow_up_status'),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
      supabase.from('profiles').select('member_since').not('member_since', 'is', null),
      supabase.from('department_memberships').select('department_id, status, departments(name)').eq('status', 'active'),
      supabase.from('connect_students').select('status'),
      supabase.from('discipleship_students').select('user_id'),
      supabase.from('prayer_requests').select('status'),
    ]);

    const crosspoints = crosspointsRes.data ?? [];
    const activeCrosspoints = crosspoints.filter(c => c.status === 'active');

    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }) });
    }
    const memberSinceDates = (allProfilesRes.data ?? []).map(p => new Date(p.member_since!));
    const memberGrowth = months.map(({ key, label }) => {
      const [y, m] = key.split('-').map(Number);
      const cumulative = memberSinceDates.filter(d => d.getFullYear() < y || (d.getFullYear() === y && d.getMonth() <= m)).length;
      return { month: label, count: cumulative };
    });

    const deptCounts = new Map<string, number>();
    (deptMembershipsRes.data ?? []).forEach((m: any) => {
      const name = m.departments?.name ?? m.department_id;
      deptCounts.set(name, (deptCounts.get(name) ?? 0) + 1);
    });
    const departmentStats = Array.from(deptCounts.entries()).map(([name, members]) => ({ name, members })).slice(0, 6);

    const crosspointCapacity = crosspoints.map(cp => ({ name: cp.name.replace(' Crosspoint', ''), current: cp.member_count, max: cp.max_members }));

    const connectStudents = connectStudentsRes.data ?? [];
    const connectCompletionRate = connectStudents.length > 0 ? Math.round((connectStudents.filter(s => s.status === 'completed').length / connectStudents.length) * 100) : 0;

    const guests = guestsRes.data ?? [];
    const guestRetentionRate = guests.length > 0 ? Math.round((guests.filter(g => g.follow_up_status === 'converted').length / guests.length) * 100) : 0;

    const avgCrosspointSize = activeCrosspoints.length > 0 ? Math.round((activeCrosspoints.reduce((s, c) => s + c.member_count, 0) / activeCrosspoints.length) * 10) / 10 : 0;

    const totalMembers = membersRes.count ?? 0;
    const discipleshipParticipants = new Set((discStudentsRes.data ?? []).map(d => d.user_id)).size;
    const discipleshipParticipationRate = totalMembers > 0 ? Math.round((discipleshipParticipants / totalMembers) * 100) : 0;

    const prayers = prayerRes.data ?? [];
    const prayerAnsweredRate = prayers.length > 0 ? Math.round((prayers.filter(p => p.status === 'answered').length / prayers.length) * 100) : 0;

    setStats({
      totalMembers, activeCrosspoints: activeCrosspoints.length, totalGuests: guests.length,
      upcomingEvents: eventsRes.count ?? 0, memberGrowth, departmentStats, crosspointCapacity,
      connectCompletionRate, guestRetentionRate, avgCrosspointSize, discipleshipParticipationRate, prayerAnsweredRate,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !stats) {
    return <AdminLayout title="Reports"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  const maxGrowth = Math.max(...stats.memberGrowth.map(m => m.count), 1);
  const maxDept = Math.max(...stats.departmentStats.map(d => d.members), 1);

  return (
    <AdminLayout title="Reports" requirePermission={{ moduleKey: 'reports', action: 'view' }}>
      <PageHeader title="Reports & Analytics" subtitle="Church growth and engagement metrics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <Users className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
          <p className="text-sm text-gray-500">Total Members</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <Home className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeCrosspoints}</p>
          <p className="text-sm text-gray-500">Active Crosspoints</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <TrendingUp className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGuests}</p>
          <p className="text-sm text-gray-500">Total Guests</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <Calendar className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
          <p className="text-sm text-gray-500">Upcoming Events</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Member Growth</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end gap-4">
            {stats.memberGrowth.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-[#BF0A30] rounded-t-lg" style={{ height: `${Math.max((item.count / maxGrowth) * 100, 2)}%` }} />
                <span className="text-xs text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
            <span className="text-sm text-gray-500">6 month cumulative members</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Department Distribution</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          {stats.departmentStats.length === 0 ? (
            <p className="text-sm text-gray-500">No department memberships yet</p>
          ) : (
          <div className="space-y-4">
            {stats.departmentStats.map((dept, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1"><span className="text-gray-700 dark:text-gray-300">{dept.name}</span><span className="font-medium">{dept.members}</span></div>
                <div className="h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden"><div className="h-full bg-[#BF0A30] rounded-full" style={{ width: `${(dept.members / maxDept) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Crosspoint Capacity</h2>
            <Home className="w-5 h-5 text-gray-400" />
          </div>
          {stats.crosspointCapacity.length === 0 ? (
            <p className="text-sm text-gray-500">No crosspoints yet</p>
          ) : (
          <div className="space-y-4">
            {stats.crosspointCapacity.map((cp, i) => {
              const pct = cp.max > 0 ? (cp.current / cp.max) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1"><span className="text-gray-700 dark:text-gray-300">{cp.name}</span><span className="font-medium">{cp.current}/{cp.max}</span></div>
                  <div className="h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg"><span className="text-gray-600 dark:text-gray-400">Connect Class Completion Rate</span><span className="font-bold text-gray-900 dark:text-white">{stats.connectCompletionRate}%</span></div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg"><span className="text-gray-600 dark:text-gray-400">Guest Retention Rate</span><span className="font-bold text-gray-900 dark:text-white">{stats.guestRetentionRate}%</span></div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg"><span className="text-gray-600 dark:text-gray-400">Average Crosspoint Size</span><span className="font-bold text-gray-900 dark:text-white">{stats.avgCrosspointSize}</span></div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg"><span className="text-gray-600 dark:text-gray-400">Members in Discipleship</span><span className="font-bold text-gray-900 dark:text-white">{stats.discipleshipParticipationRate}%</span></div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg"><span className="text-gray-600 dark:text-gray-400">Prayer Requests Answered</span><span className="font-bold text-gray-900 dark:text-white">{stats.prayerAnsweredRate}%</span></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
