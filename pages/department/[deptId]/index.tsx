import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Users, Calendar, Bell, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { DepartmentIcon } from '@/components/shared/DepartmentIcon';
import { useDepartment } from '@/hooks/useDepartment';
import { supabase } from '@/lib/supabase';

interface EventRow { id: string; title: string; event_date: string; start_time: string | null }
interface NoticeRow { id: string; title: string; published_at: string; priority: string }
interface MemberRow { user_id: string; profiles: { first_name: string; last_name: string; phone: string | null } | null }

export default function DepartmentDashboardPage() {
  const router = useRouter();
  const { deptId } = router.query as { deptId?: string };
  const { department, loading: deptLoading } = useDepartment(deptId);

  const [upcomingEvents, setUpcomingEvents] = useState<EventRow[]>([]);
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!deptId) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const [eventsRes, noticesRes, membersRes] = await Promise.all([
      supabase.from('events').select('id, title, event_date, start_time').eq('type', 'department').eq('department_id', deptId).gte('event_date', today).order('event_date').limit(5),
      supabase.from('notices').select('id, title, published_at, priority').eq('scope', 'department').eq('target_id', deptId).order('published_at', { ascending: false }).limit(3),
      supabase.from('department_memberships').select('user_id, profiles(first_name, last_name, phone)').eq('department_id', deptId).eq('status', 'active').limit(4),
    ]);
    setUpcomingEvents(eventsRes.data ?? []);
    setNotices(noticesRes.data ?? []);
    setMembers((membersRes.data as any) ?? []);
    setLoading(false);
  }, [deptId]);

  useEffect(() => { load(); }, [load]);

  if (deptLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!department) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Department not found</p>
          <Link href="/department" className="text-[#BF0A30] hover:underline">Select a department</Link>
        </div>
      </div>
    );
  }

  return (
    <DepartmentLayout department={department} title="Dashboard">
      <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white"><DepartmentIcon name={department.icon} className="w-7 h-7" /></div>
          <div>
            <h1 className="text-2xl font-bold">{department.name}</h1>
            <p className="text-white/80">{department.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Users className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{department.memberCount}</p>
          <p className="text-sm text-gray-500">Total Members</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Calendar className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingEvents.length}</p>
          <p className="text-sm text-gray-500">Upcoming Events</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Bell className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{notices.length}</p>
          <p className="text-sm text-gray-500">Active Notices</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Link href={`/department/${deptId}/schedule`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-600" /></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule</span>
        </Link>
        <Link href={`/department/${deptId}/notices`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Bell className="w-5 h-5 text-green-600" /></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Post Notice</span>
        </Link>
        <Link href={`/department/${deptId}/resources`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><FileText className="w-5 h-5 text-amber-600" /></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Resources</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Schedule</h2>
            <Link href={`/department/${deptId}/schedule`} className="text-sm text-[#BF0A30] hover:underline flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No upcoming events</div>
          ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-4">
                <div className="w-14 text-center">
                  <div className="bg-[#BF0A30]/10 rounded-lg p-2">
                    <p className="text-xs text-[#BF0A30] font-medium">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-xl font-bold text-[#BF0A30]">{new Date(event.event_date).getDate()}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                  {event.start_time && <p className="text-sm text-gray-500">{event.start_time}</p>}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Members</h2>
            {members.length === 0 ? (
              <p className="text-sm text-gray-500">No members yet</p>
            ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.user_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold">
                    {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.profiles?.first_name} {member.profiles?.last_name}</p>
                    <p className="text-xs text-gray-500">{member.profiles?.phone}</p>
                  </div>
                </div>
              ))}
            </div>
            )}
            <Link href={`/department/${deptId}/members`} className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">View All Members</Link>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Notices</h2>
            {notices.length === 0 ? (
              <p className="text-sm text-gray-500">No notices yet</p>
            ) : (
            <div className="space-y-3">
              {notices.map(notice => (
                <div key={notice.id} className={`p-3 rounded-lg border-l-4 ${notice.priority === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' : 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10'}`}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notice.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notice.published_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            )}
            <Link href={`/department/${deptId}/notices`} className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">View All Notices</Link>
          </div>
        </div>
      </div>
    </DepartmentLayout>
  );
}
