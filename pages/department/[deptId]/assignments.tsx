import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, ClipboardList, Calendar, User, Check, X, Clock, Filter } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments, mockMembers } from '@/data';

// Mock assignments data
const mockAssignments = [
  { id: 'a1', memberId: 'user-003', task: 'Sunday First Service', date: '2026-02-08', time: '7:30 AM', status: 'confirmed', notes: '' },
  { id: 'a2', memberId: 'user-010', task: 'Sunday First Service', date: '2026-02-08', time: '7:30 AM', status: 'confirmed', notes: '' },
  { id: 'a3', memberId: 'user-006', task: 'Sunday Second Service', date: '2026-02-08', time: '10:30 AM', status: 'pending', notes: '' },
  { id: 'a4', memberId: 'user-003', task: 'Wednesday Midweek', date: '2026-02-11', time: '6:00 PM', status: 'pending', notes: '' },
  { id: 'a5', memberId: 'user-010', task: 'Team Practice', date: '2026-02-12', time: '5:00 PM', status: 'declined', notes: 'Out of town' },
  { id: 'a6', memberId: 'user-006', task: 'Team Practice', date: '2026-02-12', time: '5:00 PM', status: 'confirmed', notes: '' },
];

export default function DepartmentAssignmentsPage() {
  const router = useRouter();
  const { deptId } = router.query;
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');
  
  const department = mockDepartments.find(d => d.id === deptId);
  
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  const filtered = mockAssignments.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesStatus;
  });

  const stats = {
    total: mockAssignments.length,
    confirmed: mockAssignments.filter(a => a.status === 'confirmed').length,
    pending: mockAssignments.filter(a => a.status === 'pending').length,
    declined: mockAssignments.filter(a => a.status === 'declined').length,
  };

  const getMember = (memberId: string) => mockMembers.find(m => m.id === memberId);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Check className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'declined': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  // Group by date
  const groupedByDate = filtered.reduce((acc, assignment) => {
    if (!acc[assignment.date]) {
      acc[assignment.date] = [];
    }
    acc[assignment.date].push(assignment);
    return acc;
  }, {} as Record<string, typeof mockAssignments>);

  return (
    <DepartmentLayout department={department} title="Assignments">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Duty Assignments</h1>
          <p className="text-gray-500">Manage member assignments and duties</p>
        </div>
        <Link href={`/department/${deptId}/assignments/new`} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />Create Assignment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button onClick={() => setStatusFilter('all')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border p-4 text-left transition-colors ${statusFilter === 'all' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </button>
        <button onClick={() => setStatusFilter('confirmed')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-green-500 border p-4 text-left transition-colors ${statusFilter === 'confirmed' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </button>
        <button onClick={() => setStatusFilter('pending')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-amber-500 border p-4 text-left transition-colors ${statusFilter === 'pending' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </button>
        <button onClick={() => setStatusFilter('declined')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-red-500 border p-4 text-left transition-colors ${statusFilter === 'declined' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Declined</p>
          <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
        </button>
      </div>

      {/* Assignments grouped by date */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).map(([date, assignments]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/10 flex flex-col items-center justify-center">
                <p className="text-xs text-[#BF0A30] font-medium">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</p>
                <p className="text-lg font-bold text-[#BF0A30]">{new Date(date).getDate()}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                <p className="text-sm text-gray-500">{assignments.length} assignment{assignments.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
              <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {assignments.map(assignment => {
                  const member = getMember(assignment.memberId);
                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                          {member?.firstName[0]}{member?.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{member?.firstName} {member?.lastName}</p>
                          <p className="text-sm text-gray-500">{assignment.task} • {assignment.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getStatusStyle(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          {assignment.status}
                        </span>
                        {assignment.status === 'pending' && (
                          <div className="flex gap-1">
                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Confirm"><Check className="w-4 h-4" /></button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Decline"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No assignments found</p>
        </div>
      )}
    </DepartmentLayout>
  );
}
