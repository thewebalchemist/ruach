import Link from 'next/link';
import { Users, Home, GraduationCap, Calendar, AlertCircle, ChevronRight, UserPlus, ArrowRight } from 'lucide-react';
import { AdminLayout, StatCard, PageHeader } from '@/components/connect/AdminLayout';
import { getDashboardStats, mockMembers, mockGuests, mockCrosspoints } from '@/data';

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const recentMembers = mockMembers.slice(-5).reverse();
  const recentGuests = mockGuests.slice(-3);

  const attentionItems = [
    { label: 'Guest follow-ups pending', count: stats.guests.pendingFollowUp, href: '/admin/members/guests' },
    { label: 'Crosspoint transfer requests', count: stats.crosspoints.pendingTransfers, href: '/admin/crosspoints/transfers' },
    { label: 'Department join requests', count: stats.departments.pendingRequests, href: '/admin/departments' },
    { label: 'Prayer requests to review', count: stats.prayer.pending, href: '/admin/prayer' },
  ].filter(item => item.count > 0);

  return (
    <AdminLayout title="Dashboard">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening at Ruach today." />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Members" value={stats.members.total} subtitle={`${stats.members.leaders} leaders`} icon={<Users className="w-6 h-6" />} />
        <StatCard title="Active Crosspoints" value={stats.crosspoints.active} subtitle={`${stats.crosspoints.forming} forming`} icon={<Home className="w-6 h-6" />} />
        <StatCard title="In Discipleship" value={stats.discipleship.activeCohorts} subtitle="active cohorts" icon={<GraduationCap className="w-6 h-6" />} />
        <StatCard title="Upcoming Events" value={stats.events.upcoming} subtitle="this month" icon={<Calendar className="w-6 h-6" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Attention Required */}
          {attentionItems.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#BF0A30]" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Requires Attention</h2>
              </div>
              <div className="space-y-3">
                {attentionItems.map((item, i) => (
                  <Link key={i} href={item.href} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#2D2D2D]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">{item.count}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Guests */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Guests</h2>
              <Link href="/admin/members/guests" className="text-sm text-[#BF0A30] hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {recentGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">{guest.firstName[0]}{guest.lastName[0]}</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{guest.firstName} {guest.lastName}</p>
                      <p className="text-sm text-gray-500">Visited {new Date(guest.visitDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${guest.followUpStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{guest.followUpStatus}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Members</h2>
              <Link href="/admin/members" className="text-sm text-[#BF0A30] hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-[#252525]">
                    <th className="py-3 px-4">Member</th><th className="py-3 px-4">ID</th><th className="py-3 px-4">Role</th><th className="py-3 px-4">Crosspoint</th><th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                  {recentMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-[#252525]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold">{m.firstName[0]}{m.lastName[0]}</div>
                          <span className="font-medium text-gray-900 dark:text-white">{m.firstName} {m.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-600 dark:text-gray-400">{m.memberId}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize">{m.role}</span></td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{m.crosspoint?.crosspointName || '—'}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/admin/members/new" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-[#BF0A30] text-white hover:bg-[#B00325]"><UserPlus className="w-4 h-4" />Add New Member</Link>
              <Link href="/admin/crosspoints/new" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"><Home className="w-4 h-4" />Create Crosspoint</Link>
              <Link href="/admin/events/new" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"><Calendar className="w-4 h-4" />Create Event</Link>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Crosspoints</h2>
              <Link href="/admin/crosspoints" className="text-sm text-[#BF0A30] hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {mockCrosspoints.slice(0, 4).map((cp) => (
                <div key={cp.id} className="flex items-center justify-between p-4">
                  <div><p className="font-medium text-gray-900 dark:text-white">{cp.name}</p><p className="text-sm text-gray-500">{cp.area}</p></div>
                  <div className="text-right"><p className="text-sm font-medium">{cp.memberCount}/{cp.maxMembers}</p><span className={`text-xs px-2 py-0.5 rounded-full ${cp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{cp.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
