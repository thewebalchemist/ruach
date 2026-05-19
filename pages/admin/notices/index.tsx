import { useState } from 'react';
import Link from 'next/link';
import { Plus, Bell, Eye, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { mockNotices, getMemberById } from '@/data';

export default function NoticesPage() {
  const [filter, setFilter] = useState('all');

  const filtered = mockNotices.filter(n => filter === 'all' || n.scope === filter);

  return (
    <AdminLayout title="Notices">
      <PageHeader 
        title="Notices & Announcements" 
        subtitle="Manage church-wide and targeted announcements"
        actions={<Link href="/admin/notices/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg"><Plus className="w-4 h-4" />Create Notice</Link>}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'all', label: 'Church-wide' },
          { id: 'members', label: 'Members Only' },
          { id: 'leaders', label: 'Leaders Only' },
          { id: 'department', label: 'Department' },
          { id: 'crosspoint', label: 'Crosspoint' },
        ].map((tab, i) => (
          <button
            key={i}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#BF0A30] text-white'
                : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.map((notice) => {
          const author = getMemberById(notice.authorId);
          return (
            <div key={notice.id} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border ${notice.priority === 'high' ? 'border-l-4 border-l-red-500' : notice.priority === 'medium' ? 'border-l-4 border-l-amber-500' : ''} border-gray-200 dark:border-[#2D2D2D] p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      notice.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notice.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>{notice.priority}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(notice.publishedAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{notice.scope}</span>
                    {notice.expiresAt && <span>Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">{notice.content}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2D2D2D]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>By {author?.firstName} {author?.lastName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notices found</p>
        </div>
      )}
    </AdminLayout>
  );
}
