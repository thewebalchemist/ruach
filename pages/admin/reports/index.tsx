import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BarChart3, Users, Home, TrendingUp, Download, Calendar, PieChart } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Stats {
  total_members: number;
  active_crosspoints: number;
  total_guests: number;
  upcoming_events: number;
}

interface DepartmentStat {
  name: string;
  member_count: number;
}

interface CrosspointStat {
  name: string;
  member_count: number;
  max_members: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState<Stats>({ total_members: 0, active_crosspoints: 0, total_guests: 0, upcoming_events: 0 });
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [crosspointStats, setCrosspointStats] = useState<CrosspointStat[]>([]);
  const [prayerAnsweredPct, setPrayerAnsweredPct] = useState(0);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
    if (!profile || !['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }

  async function loadData() {
    const now = new Date().toISOString();
    const [membersRes, crosspointsRes, guestsRes, eventsRes, deptsRes, cpListRes, prayerTotalRes, prayerAnsweredRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('crosspoints').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('guests').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }).gte('start_date', now),
      supabase.from('departments').select('name, member_count').order('member_count', { ascending: false }).limit(6),
      supabase.from('crosspoints').select('name, member_count, max_members').eq('status', 'active').order('name'),
      supabase.from('prayer_requests').select('id', { count: 'exact', head: true }),
      supabase.from('prayer_requests').select('id', { count: 'exact', head: true }).eq('status', 'answered'),
    ]);

    setStats({
      total_members: membersRes.count ?? 0,
      active_crosspoints: crosspointsRes.count ?? 0,
      total_guests: guestsRes.count ?? 0,
      upcoming_events: eventsRes.count ?? 0,
    });

    if (deptsRes.data) setDepartmentStats(deptsRes.data);
    if (cpListRes.data) setCrosspointStats(cpListRes.data);

    const totalPr = prayerTotalRes.count ?? 0;
    const answeredPr = prayerAnsweredRes.count ?? 0;
    setPrayerAnsweredPct(totalPr > 0 ? Math.round((answeredPr / totalPr) * 100) : 0);

    setLoading(false);
  }

  if (loading) {
    return (
      <AdminLayout title="Reports">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Reports">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Church growth and engagement metrics"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />Export Report
          </button>
        }
      />

      {/* Period Filter */}
      <div className="flex gap-2 mb-6">
        {['week', 'month', 'quarter', 'year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
              period === p
                ? 'bg-[#BF0A30] text-white'
                : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600'
            }`}
          >
            This {p}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_members}</p>
          <p className="text-sm text-gray-500">Total Members</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-2">
            <Home className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_crosspoints}</p>
          <p className="text-sm text-gray-500">Active Crosspoints</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_guests}</p>
          <p className="text-sm text-gray-500">Total Guests</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming_events}</p>
          <p className="text-sm text-gray-500">Upcoming Events</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Department Distribution</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {departmentStats.map((dept, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{dept.name}</span>
                  <span className="font-medium">{dept.member_count}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
                  <div className="h-full bg-[#BF0A30] rounded-full" style={{ width: `${Math.min((dept.member_count / 100) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
            {departmentStats.length === 0 && <p className="text-sm text-gray-500">No department data available</p>}
          </div>
        </div>

        {/* Crosspoint Capacity */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Crosspoint Capacity</h2>
            <Home className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {crosspointStats.map((cp, i) => {
              const pct = cp.max_members > 0 ? (cp.member_count / cp.max_members) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{cp.name.replace(' Crosspoint', '')}</span>
                    <span className="font-medium">{cp.member_count}/{cp.max_members}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {crosspointStats.length === 0 && <p className="text-sm text-gray-500">No crosspoint data available</p>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Quick Stats</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Prayer Requests Answered</span>
              <span className="font-bold text-gray-900 dark:text-white">{prayerAnsweredPct}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Active Members</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.total_members}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Active Crosspoints</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.active_crosspoints}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
