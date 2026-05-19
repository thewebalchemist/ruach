import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Calendar, Check, X, Users, TrendingUp } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { mockCrosspoints, mockMembers } from '@/data';

// Mock attendance records
const mockAttendanceRecords = [
  { id: 'att-1', date: '2026-02-02', present: ['user-003', 'user-006', 'user-010'], absent: ['user-015'] },
  { id: 'att-2', date: '2026-01-26', present: ['user-003', 'user-010'], absent: ['user-006', 'user-015'] },
  { id: 'att-3', date: '2026-01-19', present: ['user-003', 'user-006', 'user-010', 'user-015'], absent: [] },
];

export default function CrosspointAttendancePage() {
  const router = useRouter();
  const { cpId } = router.query;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const crosspoint = mockCrosspoints.find(c => c.id === cpId);
  
  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  const cpMembers = mockMembers.filter(m => m.crosspoint?.crosspointId === cpId);

  // Calculate stats
  const avgAttendance = mockAttendanceRecords.reduce((sum, r) => sum + r.present.length, 0) / mockAttendanceRecords.length;
  const avgPercentage = Math.round((avgAttendance / cpMembers.length) * 100);

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Attendance">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-500">Track weekly meeting attendance</p>
        </div>
        <Link href={`/crosspoint/${cpId}/attendance/new`} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />Take Attendance
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{cpMembers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Avg. Attendance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgAttendance)}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className="text-2xl font-bold text-green-600">{avgPercentage}%</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Records</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAttendanceRecords.length}</p>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
        <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
          <h2 className="font-semibold text-gray-900 dark:text-white">Attendance History</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {mockAttendanceRecords.map(record => {
            const percentage = Math.round((record.present.length / cpMembers.length) * 100);
            const isExpanded = selectedDate === record.id;
            
            return (
              <div key={record.id}>
                <button 
                  onClick={() => setSelectedDate(isExpanded ? null : record.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/10 flex flex-col items-center justify-center">
                      <p className="text-xs text-[#BF0A30] font-medium">{new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-lg font-bold text-[#BF0A30]">{new Date(record.date).getDate()}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                      <p className="text-sm text-gray-500">{record.present.length} present • {record.absent.length} absent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {percentage}%
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                          <Check className="w-4 h-4" />Present ({record.present.length})
                        </p>
                        <div className="space-y-2">
                          {record.present.map(memberId => {
                            const member = mockMembers.find(m => m.id === memberId);
                            return member ? (
                              <div key={memberId} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                                  {member.firstName[0]}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{member.firstName} {member.lastName}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                          <X className="w-4 h-4" />Absent ({record.absent.length})
                        </p>
                        <div className="space-y-2">
                          {record.absent.length > 0 ? record.absent.map(memberId => {
                            const member = mockMembers.find(m => m.id === memberId);
                            return member ? (
                              <div key={memberId} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                                  {member.firstName[0]}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{member.firstName} {member.lastName}</span>
                              </div>
                            ) : null;
                          }) : (
                            <p className="text-sm text-gray-500">Everyone was present! 🎉</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CrosspointLayout>
  );
}
