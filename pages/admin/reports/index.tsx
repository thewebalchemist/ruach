import { useState } from 'react';
import { BarChart3, Users, Home, TrendingUp, Download, Calendar, PieChart } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { getDashboardStats, mockMembers, mockCrosspoints, mockDepartments } from '@/data';

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const stats = getDashboardStats();

  // Mock chart data
  const memberGrowth = [
    { month: 'Sep', count: 180 },
    { month: 'Oct', count: 195 },
    { month: 'Nov', count: 210 },
    { month: 'Dec', count: 225 },
    { month: 'Jan', count: 240 },
    { month: 'Feb', count: stats.members.total },
  ];

  const departmentStats = mockDepartments.slice(0, 6).map(d => ({
    name: d.name,
    members: d.memberCount,
  }));

  const crosspointCapacity = mockCrosspoints.map(cp => ({
    name: cp.name.replace(' Crosspoint', ''),
    current: cp.memberCount,
    max: cp.maxMembers,
  }));

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
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.members.total}</p>
          <p className="text-sm text-gray-500">Total Members</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-2">
            <Home className="w-5 h-5 text-[#BF0A30]" />
            <span className="text-xs text-green-600 font-medium">+2</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.crosspoints.active}</p>
          <p className="text-sm text-gray-500">Active Crosspoints</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#BF0A30]" />
            <span className="text-xs text-green-600 font-medium">+8</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.guests.total}</p>
          <p className="text-sm text-gray-500">New Guests</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-[#BF0A30]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.events.upcoming}</p>
          <p className="text-sm text-gray-500">Upcoming Events</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Member Growth</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end gap-4">
            {memberGrowth.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-[#BF0A30]/20 rounded-t-lg relative" style={{ height: `${(item.count / 300) * 100}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#BF0A30] rounded-t-lg" style={{ height: '100%' }} />
                </div>
                <span className="text-xs text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
            <span className="text-sm text-gray-500">6 month trend</span>
            <span className="text-sm font-medium text-green-600">+38% growth</span>
          </div>
        </div>

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
                  <span className="font-medium">{dept.members}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
                  <div className="h-full bg-[#BF0A30] rounded-full" style={{ width: `${(dept.members / 100) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crosspoint Capacity */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Crosspoint Capacity</h2>
            <Home className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {crosspointCapacity.map((cp, i) => {
              const pct = (cp.current / cp.max) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{cp.name}</span>
                    <span className="font-medium">{cp.current}/{cp.max}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Connect Class Completion Rate</span>
              <span className="font-bold text-gray-900 dark:text-white">87%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Guest Retention Rate</span>
              <span className="font-bold text-gray-900 dark:text-white">65%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Average Crosspoint Attendance</span>
              <span className="font-bold text-gray-900 dark:text-white">10.2</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Members in Discipleship</span>
              <span className="font-bold text-gray-900 dark:text-white">42%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Prayer Requests Answered</span>
              <span className="font-bold text-gray-900 dark:text-white">78%</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
