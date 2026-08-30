import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Home, GraduationCap, Calendar, AlertCircle, ChevronRight, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { AdminLayout, StatCard, PageHeader } from '@/components/connect/AdminLayout';
import { IntroGuide } from '@/components/connect/IntroGuide';
import { supabase } from '@/lib/supabase';

interface Stats {
  membersTotal: number; membersLeaders: number;
  crosspointsActive: number; crosspointsForming: number;
  discipleshipActiveCohorts: number; eventsUpcoming: number;
  guestsPendingFollowUp: number; crosspointsPendingTransfers: number;
  departmentsPendingRequests: number; prayerPending: number;
}
interface Guest { id: string; first_name: string; last_name: string; visit_date: string; follow_up_status: string }
interface Member { id: string; first_name: string; last_name: string; member_id: string | null; role: string; status: string; crosspointName: string | null }
interface CrosspointRow { id: string; name: string; area: string; status: string; member_count: number; max_members: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentGuests, setRecentGuests] = useState<Guest[]>([]);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [crosspoints, setCrosspoints] = useState<CrosspointRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      membersRes, leadersRes, cpActiveRes, cpFormingRes, discCohortsRes, eventsRes,
      guestsPendingRes, transfersRes, deptRequestsRes, prayerPendingRes,
      recentGuestsRes, recentMembersRes, crosspointsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).not('member_id', 'is', null),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'leader'),
      supabase.from('crosspoints').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('crosspoints').select('id', { count: 'exact', head: true }).eq('status', 'forming'),
      supabase.from('discipleship_cohorts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
      supabase.from('guests').select('id', { count: 'exact', head: true }).eq('follow_up_status', 'pending'),
      supabase.from('transfer_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('department_join_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('prayer_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('guests').select('id, first_name, last_name, visit_date, follow_up_status').order('visit_date', { ascending: false }).limit(3),
      supabase.from('profiles').select('id, first_name, last_name, member_id, role, status, crosspoint_memberships(crosspoints(name))').not('member_id', 'is', null).order('member_since', { ascending: false }).limit(5),
      supabase.from('crosspoints').select('id, name, area, status, member_count, max_members').order('name').limit(4),
    ]);

    setStats({
      membersTotal: membersRes.count ?? 0,
      membersLeaders: leadersRes.count ?? 0,
      crosspointsActive: cpActiveRes.count ?? 0,
      crosspointsForming: cpFormingRes.count ?? 0,
      discipleshipActiveCohorts: discCohortsRes.count ?? 0,
      eventsUpcoming: eventsRes.count ?? 0,
      guestsPendingFollowUp: guestsPendingRes.count ?? 0,
      crosspointsPendingTransfers: transfersRes.count ?? 0,
      departmentsPendingRequests: deptRequestsRes.count ?? 0,
      prayerPending: prayerPendingRes.count ?? 0,
    });
    setRecentGuests(recentGuestsRes.data ?? []);
    setRecentMembers((recentMembersRes.data ?? []).map((m: any) => ({
      id: m.id, first_name: m.first_name, last_name: m.last_name, member_id: m.member_id,
      role: m.role, status: m.status,
      crosspointName: m.crosspoint_memberships?.[0]?.crosspoints?.name ?? null,
    })));
    setCrosspoints(crosspointsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !stats) {
    return <AdminLayout title="Dashboard"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  const attentionItems = [
    { label: 'Guest follow-ups pending', count: stats.guestsPendingFollowUp, href: '/admin/members/guests' },
    { label: 'Crosspoint transfer requests', count: stats.crosspointsPendingTransfers, href: '/admin/crosspoints/transfers' },
    { label: 'Department join requests', count: stats.departmentsPendingRequests, href: '/admin/departments/requests' },
    { label: 'Prayer requests to review', count: stats.prayerPending, href: '/admin/prayer' },
  ].filter(item => item.count > 0);

  return (
    <AdminLayout title="Dashboard" requirePermission={{ moduleKey: 'dashboard', action: 'view' }}>
      <IntroGuide />
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening at Ruach today." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Members" value={stats.membersTotal} subtitle={`${stats.membersLeaders} leaders`} icon={<Users className="w-6 h-6" />} />
        <StatCard title="Active Crosspoints" value={stats.crosspointsActive} subtitle={`${stats.crosspointsForming} forming`} icon={<Home className="w-6 h-6" />} />
        <StatCard title="In Discipleship" value={stats.discipleshipActiveCohorts} subtitle="active cohorts" icon={<GraduationCap className="w-6 h-6" />} />
        <StatCard title="Upcoming Events" value={stats.eventsUpcoming} subtitle="this month" icon={<Calendar className="w-6 h-6" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Guests</h2>
              <Link href="/admin/members/guests" className="text-sm text-[#BF0A30] hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {recentGuests.length > 0 ? recentGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">{guest.first_name[0]}{guest.last_name[0]}</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{guest.first_name} {guest.last_name}</p>
                      <p className="text-sm text-gray-500">Visited {new Date(guest.visit_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${guest.follow_up_status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{guest.follow_up_status}</span>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500">No guests yet</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Members</h2>
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
                          <span className="font-medium text-gray-900 dark:text-white">{m.first_name} {m.last_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-600 dark:text-gray-400">{m.member_id ?? '—'}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize">{m.role}</span></td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 capitalize">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentMembers.length === 0 && <div className="p-8 text-center text-gray-500">No members yet</div>}
            </div>
          </div>
        </div>

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
            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {crosspoints.map((cp) => (
                <div key={cp.id} className="flex items-center justify-between p-4">
                  <div><p className="font-medium text-gray-900 dark:text-white">{cp.name}</p><p className="text-sm text-gray-500">{cp.area}</p></div>
                  <div className="text-right"><p className="text-sm font-medium">{cp.member_count}/{cp.max_members}</p><span className={`text-xs px-2 py-0.5 rounded-full ${cp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{cp.status}</span></div>
                </div>
              ))}
              {crosspoints.length === 0 && <div className="p-8 text-center text-gray-500">No crosspoints yet</div>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
