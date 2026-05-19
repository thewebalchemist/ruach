import { useRouter } from 'next/router';
import Link from 'next/link';
import { Users, Calendar, BookOpen, ClipboardList, ChevronRight, Plus, TrendingUp, Home, MapPin, Clock } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { mockCrosspoints, mockMembers, getMemberById, mockCrosspointModules } from '@/data';

export default function CrosspointDashboardPage() {
  const router = useRouter();
  const { cpId } = router.query;
  
  const crosspoint = mockCrosspoints.find(c => c.id === cpId);
  
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

  const leader = getMemberById(crosspoint.leaderId);
  const cpMembers = mockMembers.filter(m => m.crosspoint?.crosspointId === cpId);
  const currentModule = mockCrosspointModules.find(m => m.weekNumber === 3); // Current week
  const capacityPct = (crosspoint.memberCount / crosspoint.maxMembers) * 100;

  // Mock attendance data
  const recentAttendance = [
    { date: '2026-02-02', present: 11, total: 12 },
    { date: '2026-01-26', present: 10, total: 12 },
    { date: '2026-01-19', present: 12, total: 12 },
  ];

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Dashboard">
      {/* Welcome Banner */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <Users className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{crosspoint.memberCount}</p>
          <p className="text-sm text-gray-500">Total Members</p>
          <div className="mt-2 h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${capacityPct}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{crosspoint.maxMembers - crosspoint.memberCount} slots available</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <ClipboardList className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentAttendance[0]?.present || 0}</p>
          <p className="text-sm text-gray-500">Last Attendance</p>
          <p className="text-xs text-green-600 mt-2">{Math.round((recentAttendance[0]?.present / recentAttendance[0]?.total) * 100)}% present</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <BookOpen className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Week 3</p>
          <p className="text-sm text-gray-500">Current Module</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <TrendingUp className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
          <p className="text-sm text-gray-500">Avg. Attendance</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Link href={`/crosspoint/${cpId}/attendance/new`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
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
        <Link href={`/crosspoint/${cpId}/members/new`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Add Member</span>
        </Link>
        <Link href={`/crosspoint/${cpId}/food-bank/new`} className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Plus className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Food Bank Request</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* This Week's Module */}
          {currentModule && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#BF0A30]" />This Week's Module
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#BF0A30] text-white">Week {currentModule.weekNumber}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{currentModule.title}</h3>
              <p className="text-[#BF0A30] font-medium mb-3">{currentModule.scripture}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{currentModule.description}</p>
              <Link href={`/crosspoint/${cpId}/module`} className="inline-flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
                View Full Module <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Recent Attendance */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Attendance</h2>
              <Link href={`/crosspoint/${cpId}/attendance`} className="text-sm text-[#BF0A30] hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {recentAttendance.map((record, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm text-gray-500">{record.present} of {record.total} present</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.round((record.present / record.total) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leadership */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Leadership</h2>
            {leader && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg mb-2">
                <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                  {leader.firstName[0]}{leader.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{leader.firstName} {leader.lastName}</p>
                  <p className="text-xs text-gray-500">Leader • {leader.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Members</h2>
            <div className="space-y-2">
              {cpMembers.slice(0, 5).map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#252525] flex items-center justify-center text-xs font-semibold">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{member.firstName} {member.lastName}</p>
                </div>
              ))}
            </div>
            <Link href={`/crosspoint/${cpId}/members`} className="block mt-4 text-center py-2 text-sm text-[#BF0A30] hover:underline">
              View All {cpMembers.length} Members
            </Link>
          </div>

          {/* Meeting Info */}
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
