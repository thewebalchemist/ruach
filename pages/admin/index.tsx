import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Users, Home, GraduationCap, Calendar, AlertCircle, ChevronRight, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { AdminLayout, StatCard, PageHeader } from '@/components/connect/AdminLayout';
import { IntroGuide } from '@/components/connect/IntroGuide';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface DashboardStats {
  totalMembers: number;
  leaders: number;
  activeCrosspoints: number;
  formingCrosspoints: number;
  activeCohorts: number;
  upcomingEvents: number;
  pendingGuests: number;
  pendingTransfers: number;
  pendingDeptRequests: number;
  pendingPrayer: number;
}

interface RecentMember {
  id: string;
  first_name: string;
  last_name: string;
  member_id: string | null;
  role: string;
  status: string;
  created_at: string;
  crosspoint_memberships: { crosspoint_id: string; crosspoints: { name: string } | null } | null;
}

interface RecentGuest {
  id: string;
  first_name: string;
  last_name: string;
  visit_date: string;
  follow_up_status: string;
}

interface CrosspointRow {
  id: string;
  name: string;
  area: string;
  status: string;
  member_count: number;
  max_members: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0, leaders: 0, activeCrosspoints: 0, formingCrosspoints: 0,
    activeCohorts: 0, upcomingEvents: 0, pendingGuests: 0, pendingTransfers: 0,
    pendingDeptRequests: 0, pendingPrayer: 0,
  });
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [recentGuests, setRecentGuests] = useState<RecentGuest[]>([]);
  const [crosspoints, setCrosspoints] = useState<CrosspointRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=/admin'); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) {
      router.push('/');
      return;
    }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setLoading(true);

    const [
      { count: membersCount },
      { count: leadersCount },
      { count: activeCP },
      { count: formingCP },
      { count: cohorts },
      { count: events },
      { count: pendingGuests },
      { count: pendingTransfers },
      { count: pendingDept },
      { count: pendingPrayer },
      { data: members },
      { data: guests },
      { data: cpData },
    ] = await Promise.all([
      // Count queries
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .neq('role', 'student').eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
        .in('role', ['leader', 'admin', 'pastor']),
      supabase.from('crosspoints').select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('crosspoints').select('id', { count: 'exact', head: true })
        .eq('status', 'forming'),
      supabase.from('discipleship_cohorts').select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('events').select('id', { count: 'exact', head: true })
        .eq('status', 'upcoming'),
      supabase.from('guests').select('id', { count: 'exact', head: true })
        .eq('follow_up_status', 'pending'),
      supabase.from('transfer_requests').select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('department_join_requests').select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('prayer_requests').select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      // Recent data
      db.from('profiles').select('id, first_name, last_name, member_id, role, status, created_at')
        .not('member_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5),
      db.from('guests').select('id, first_name, last_name, visit_date, follow_up_status')
        .order('created_at', { ascending: false })
        .limit(3),
      db.from('crosspoints').select('id, name, area, status, member_count, max_members')
        .order('member_count', { ascending: false })
        .limit(4),
    ]);

    setStats({
      totalMembers: membersCount ?? 0,
      leaders: leadersCount ?? 0,
      activeCrosspoints: activeCP ?? 0,
      formingCrosspoints: formingCP ?? 0,
      activeCohorts: cohorts ?? 0,
      upcomingEvents: events ?? 0,
      pendingGuests: pendingGuests ?? 0,
      pendingTransfers: pendingTransfers ?? 0,
      pendingDeptRequests: pendingDept ?? 0,
      pendingPrayer: pendingPrayer ?? 0,
    });

    setRecentMembers((members ?? []) as RecentMember[]);
    setRecentGuests((guests ?? []) as RecentGuest[]);
    setCrosspoints((cpData ?? []) as CrosspointRow[]);

    setLoading(false);
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const attentionItems = [
    { label: 'Guest follow-ups pending', count: stats.pendingGuests, href: '/admin/members/guests' },
    { label: 'Crosspoint transfer requests', count: stats.pendingTransfers, href: '/admin/crosspoints/transfers' },
    { label: 'Department join requests', count: stats.pendingDeptRequests, href: '/admin/departments' },
    { label: 'Prayer requests to review', count: stats.pendingPrayer, href: '/admin/prayer' },
  ].filter(item => item.count > 0);

  return (
    <AdminLayout title="Dashboard">
      <IntroGuide />
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening at Ruach today." />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Members" value={stats.totalMembers} subtitle={`${stats.leaders} leaders`} icon={<Users className="w-6 h-6" />} />
        <StatCard title="Active Crosspoints" value={stats.activeCrosspoints} subtitle={`${stats.formingCrosspoints} forming`} icon={<Home className="w-6 h-6" />} />
        <StatCard title="In Discipleship" value={stats.activeCohorts} subtitle="active cohorts" icon={<GraduationCap className="w-6 h-6" />} />
        <StatCard title="Upcoming Events" value={stats.upcomingEvents} subtitle="this month" icon={<Calendar className="w-6 h-6" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Attention Required */}
          {attentionItems.length > 0 && (
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#BF0A30]" />
                <h2 className="font-semibold text-white">Requires Attention</h2>
              </div>
              <div className="space-y-3">
                {attentionItems.map((item, i) => (
                  <Link key={i} href={item.href} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">{item.count}</span>
                      <span className="text-sm text-white/70">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Guests */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Recent Guests</h2>
              <Link href="/admin/members/guests" className="text-sm text-[#BF0A30] hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {recentGuests.length > 0 ? recentGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">{guest.first_name[0]}{guest.last_name[0]}</div>
                    <div>
                      <p className="font-medium text-white">{guest.first_name} {guest.last_name}</p>
                      <p className="text-sm text-gray-500">Visited {new Date(guest.visit_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${guest.follow_up_status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{guest.follow_up_status}</span>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500 text-sm">No guests yet</div>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Recent Members</h2>
              <Link href="/admin/members" className="text-sm text-[#BF0A30] hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-white/[0.04]">
                    <th className="py-3 px-4">Member</th><th className="py-3 px-4">ID</th><th className="py-3 px-4">Role</th><th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {recentMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.06]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold">{m.first_name[0]}{m.last_name[0]}</div>
                          <span className="font-medium text-white">{m.first_name} {m.last_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-white/50">{m.member_id ?? '—'}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-white/70 capitalize">{m.role}</span></td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentMembers.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No members yet</div>}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/admin/members/new" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-[#BF0A30] text-white hover:bg-[#B00325]"><UserPlus className="w-4 h-4" />Add New Member</Link>
              <Link href="/admin/crosspoints/new" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium border border-white/10 text-white/70 hover:bg-white/[0.06]"><Home className="w-4 h-4" />Create Crosspoint</Link>
              <Link href="/admin/events/new" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium border border-white/10 text-white/70 hover:bg-white/[0.06]"><Calendar className="w-4 h-4" />Create Event</Link>
            </div>
          </div>

          <div className="bg-[#12151C] rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Crosspoints</h2>
              <Link href="/admin/crosspoints" className="text-sm text-[#BF0A30] hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {crosspoints.map((cp) => (
                <div key={cp.id} className="flex items-center justify-between p-4">
                  <div><p className="font-medium text-white">{cp.name}</p><p className="text-sm text-gray-500">{cp.area}</p></div>
                  <div className="text-right"><p className="text-sm font-medium">{cp.member_count}/{cp.max_members}</p><span className={`text-xs px-2 py-0.5 rounded-full ${cp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{cp.status}</span></div>
                </div>
              ))}
              {crosspoints.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No crosspoints yet</div>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
