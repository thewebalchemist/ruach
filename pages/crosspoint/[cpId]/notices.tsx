import { useState } from 'react';
import { useRouter } from 'next/router';
import { Plus, Bell, AlertTriangle, X } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { mockCrosspoints } from '@/data';
import { mockNotices } from '@/data/programs';

const MOCK_DATA = true;

type Priority = 'high' | 'medium' | 'normal';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  publishedAt: string;
  scope: string;
  authorId: string;
}

const crosspointNotices: Notice[] = [
  {
    id: 'cpn-001',
    title: 'Crosspoint Meeting Change - Next Week',
    content: 'Please note that next week\'s meeting will be held at the community hall instead of the usual venue. Directions will be shared on WhatsApp.',
    priority: 'high',
    publishedAt: '2026-05-08',
    scope: 'crosspoint',
    authorId: 'user-001',
  },
  {
    id: 'cpn-002',
    title: 'Welcome New Members',
    content: 'We have 2 new members joining us this week. Please make them feel welcome!',
    priority: 'normal',
    publishedAt: '2026-05-06',
    scope: 'crosspoint',
    authorId: 'user-001',
  },
  ...mockNotices.map(n => ({ ...n, priority: (n.priority === 'medium' ? 'normal' : n.priority) as Priority })),
];

export default function CrosspointNoticesPage() {
  const router = useRouter();
  const { cpId } = router.query;
  const [notices, setNotices] = useState<Notice[]>(crosspointNotices);
  const [showModal, setShowModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | Priority>('all');
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' as Priority });

  const crosspoint = mockCrosspoints.find(c => c.id === cpId);

  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  const filtered = filterPriority === 'all' ? notices : notices.filter(n => n.priority === filterPriority);

  const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ReactNode }> = {
    high: { label: 'High Priority', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: <Bell className="w-3.5 h-3.5" /> },
    normal: { label: 'Normal', color: 'bg-gray-100 text-gray-700 dark:bg-[#2D2D2D] dark:text-gray-400', icon: <Bell className="w-3.5 h-3.5" /> },
  };

  function handleCreate() {
    if (!form.title || !form.content) return;
    const newNotice: Notice = {
      id: `cpn-${Date.now()}`,
      title: form.title,
      content: form.content,
      priority: form.priority,
      publishedAt: new Date().toISOString().split('T')[0],
      scope: 'crosspoint',
      authorId: 'user-001',
    };
    setNotices(prev => [newNotice, ...prev]);
    setForm({ title: '', content: '', priority: 'normal' });
    setShowModal(false);
  }

  function removeNotice(id: string) {
    setNotices(prev => prev.filter(n => n.id !== id));
  }

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Notices">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notices</h1>
          <p className="text-gray-500">{notices.length} announcements for {crosspoint.name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
        >
          <Plus className="w-4 h-4" />Create Notice
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'high', 'medium', 'normal'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                filterPriority === p
                  ? 'bg-[#BF0A30] text-white'
                  : 'border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
              }`}
            >
              {p === 'all' ? 'All Notices' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.map(notice => {
          const cfg = priorityConfig[notice.priority];
          return (
            <div key={notice.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notice.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{notice.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{notice.content}</p>
                </div>
                <button
                  onClick={() => removeNotice(notice.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center text-gray-500">
            No notices found
          </div>
        )}
      </div>

      {/* Create Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Create Notice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Notice title"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea
                  rows={4}
                  placeholder="Notice content..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </CrosspointLayout>
  );
}
