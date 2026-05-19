import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Bell, Pin, Calendar, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments } from '@/data';

// Mock notices data
const mockDeptNotices = [
  { 
    id: 'n1', 
    title: 'New Schedule Released for February', 
    content: 'The February schedule has been released. Please check your assignments and confirm your availability by this Friday.',
    priority: 'high',
    isPinned: true,
    createdAt: '2026-02-01',
    expiresAt: '2026-02-28',
    author: 'Dept. Leader',
    views: 45
  },
  { 
    id: 'n2', 
    title: 'Training Workshop Next Saturday', 
    content: 'All members are required to attend the training workshop on Saturday, February 15th. This is mandatory for all team members.',
    priority: 'high',
    isPinned: true,
    createdAt: '2026-01-28',
    expiresAt: '2026-02-15',
    author: 'Dept. Leader',
    views: 38
  },
  { 
    id: 'n3', 
    title: 'New Equipment Available', 
    content: 'New equipment has been purchased for the department. Training sessions will be scheduled soon.',
    priority: 'medium',
    isPinned: false,
    createdAt: '2026-01-25',
    expiresAt: null,
    author: 'Dept. Leader',
    views: 22
  },
  { 
    id: 'n4', 
    title: 'Welcome New Members', 
    content: 'Please welcome our newest members who joined this month. Let\'s make them feel at home!',
    priority: 'low',
    isPinned: false,
    createdAt: '2026-01-20',
    expiresAt: null,
    author: 'Dept. Leader',
    views: 56
  },
];

export default function DepartmentNoticesPage() {
  const router = useRouter();
  const { deptId } = router.query;
  const [filter, setFilter] = useState('all');
  
  const department = mockDepartments.find(d => d.id === deptId);
  
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  const filtered = mockDeptNotices.filter(n => {
    if (filter === 'pinned') return n.isPinned;
    if (filter === 'high') return n.priority === 'high';
    return true;
  });

  const pinnedNotices = filtered.filter(n => n.isPinned);
  const regularNotices = filtered.filter(n => !n.isPinned);

  return (
    <DepartmentLayout department={department} title="Notice Board">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notice Board</h1>
          <p className="text-gray-500">Department announcements and updates</p>
        </div>
        <Link href={`/department/${deptId}/notices/new`} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />Post Notice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All Notices' },
          { id: 'pinned', label: 'Pinned' },
          { id: 'high', label: 'Important' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === tab.id
                ? 'bg-[#BF0A30] text-white'
                : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pinned Notices */}
      {pinnedNotices.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Pin className="w-4 h-4" />Pinned
          </h2>
          <div className="space-y-4">
            {pinnedNotices.map(notice => (
              <div key={notice.id} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 ${notice.priority === 'high' ? 'border-l-red-500' : 'border-l-amber-500'} border border-gray-200 dark:border-[#2D2D2D] p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pin className="w-4 h-4 text-[#BF0A30]" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                    {notice.priority === 'high' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3" />Important
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{notice.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(notice.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{notice.views} views</span>
                  </div>
                  {notice.expiresAt && <span className="text-amber-600">Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notices */}
      {regularNotices.length > 0 && (
        <div>
          {pinnedNotices.length > 0 && (
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Notices</h2>
          )}
          <div className="space-y-4">
            {regularNotices.map(notice => (
              <div key={notice.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Posted by {notice.author} • {new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-[#BF0A30]" title="Pin"><Pin className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{notice.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{notice.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notices found</p>
        </div>
      )}
    </DepartmentLayout>
  );
}
