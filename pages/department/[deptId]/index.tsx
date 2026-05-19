import { useRouter } from 'next/router';
import Link from 'next/link';
import { Users, Calendar, Bell, FileText, ClipboardList, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments, mockMembers, getMemberById } from '@/data';

export default function DepartmentDashboardPage() {
  const router = useRouter();
  const { deptId } = router.query;
  
  const department = mockDepartments.find(d => d.id === deptId);
  
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

  const leader = getMemberById(department.leaderId);
  const deptMembers = mockMembers.filter(m => 
    m.departments.some(d => d.departmentId === deptId)
  );

  // Mock data for dashboard
  const upcomingSchedule = [
    { id: 1, title: 'Sunday Service', date: '2026-02-08', time: '8:00 AM - 12:00 PM' },
    { id: 2, title: 'Team Meeting', date: '2026-02-10', time: '6:00 PM' },
    { id: 3, title: 'Practice Session', date: '2026-02-12', time: '5:00 PM' },
  ];

  const recentNotices = [
    { id: 1, title: 'New Schedule Released', date: '2026-02-01', priority: 'high' },
    { id: 2, title: 'Training Workshop', date: '2026-01-28', priority: 'medium' },
  ];

  const pendingAssignments = [
    { id: 1, member: 'James Mwangi', task: 'Sunday Duty', date: '2026-02-08' },
    { id: 2, member: 'Mary Wanjiku', task: 'Wednesday Midweek', date: '2026-02-05' },
  ];

  return (
    <DepartmentLayout department={department} title="Dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-4xl">
            {department.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{department.name}</h1>
            <p className="text-white/80">{department.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-[#BF0A30]" />
            <span className="text-xs text-green-600 font-medium">+3 this month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{department.memberCount}</p>
          <p className="text-sm text-gray-500">Total Members</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Calendar className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingSchedule.length}</p>
          <p className="text-sm text-gray-500">Upcoming Events</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <ClipboardList className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingAssignments.length}</p>
          <p className="text-sm text-gray-500">Pending Assignments</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Bell className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentNotices.length}</p>
          <p className="text-sm text-gray-500">Active Notices</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Link href={`/department/${deptId}/members/new`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Add Member</span>
        </Link>
        <Link href={`/department/${deptId}/schedule/new`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Add Schedule</span>
        </Link>
        <Link href={`/department/${deptId}/assignments/new`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Assign Duty</span>
        </Link>
        <Link href={`/department/${deptId}/notices/new`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Post Notice</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Schedule</h2>
            <Link href={`/department/${deptId}/schedule`} className="text-sm text-[#BF0A30] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
            {upcomingSchedule.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-4">
                <div className="w-14 text-center">
                  <div className="bg-[#BF0A30]/10 rounded-lg p-2">
                    <p className="text-xs text-[#BF0A30] font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-xl font-bold text-[#BF0A30]">{new Date(event.date).getDate()}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.time}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Members */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Members</h2>
            <div className="space-y-3">
              {deptMembers.slice(0, 4).map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-gray-500">{member.phone}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href={`/department/${deptId}/members`} className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">
              View All Members
            </Link>
          </div>

          {/* Notices */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Notices</h2>
            <div className="space-y-3">
              {recentNotices.map(notice => (
                <div key={notice.id} className={`p-3 rounded-lg border-l-4 ${notice.priority === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' : 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10'}`}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notice.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notice.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <Link href={`/department/${deptId}/notices`} className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">
              View All Notices
            </Link>
          </div>
        </div>
      </div>
    </DepartmentLayout>
  );
}
