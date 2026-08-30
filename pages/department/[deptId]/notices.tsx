import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Plus, Bell, AlertTriangle, X, Loader2 } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { useDepartment } from '@/hooks/useDepartment';
import { supabase } from '@/lib/supabase';

type Priority = 'high' | 'medium' | 'low';

interface Notice { id: string; title: string; content: string; priority: Priority; published_at: string }

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  high: { label: 'High Priority', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-[#2D2D2D] dark:text-gray-400' },
};

export default function DepartmentNoticesPage() {
  const router = useRouter();
  const { deptId } = router.query as { deptId?: string };
  const { department, loading: deptLoading } = useDepartment(deptId);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Priority>('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' as Priority });

  const load = useCallback(async () => {
    if (!deptId) return;
    setLoading(true);
    const { data } = await supabase.from('notices').select('id, title, content, priority, published_at').eq('scope', 'department').eq('target_id', deptId).order('published_at', { ascending: false });
    setNotices(data ?? []);
    setLoading(false);
  }, [deptId]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? notices : notices.filter(n => n.priority === filter);

  async function handleCreate() {
    if (!deptId || !form.title || !form.content) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('notices').insert({
      title: form.title, content: form.content, priority: form.priority,
      scope: 'department', target_id: deptId, author_id: session?.user.id ?? null,
    });
    setSaving(false);
    setForm({ title: '', content: '', priority: 'medium' });
    setShowModal(false);
    load();
  }

  async function removeNotice(id: string) {
    await supabase.from('notices').delete().eq('id', id);
    load();
  }

  if (deptLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  return (
    <DepartmentLayout department={department} title="Notice Board">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notice Board</h1>
          <p className="text-gray-500">Department announcements and updates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />Post Notice
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'high', 'medium', 'low'] as const).map(p => (
          <button key={p} onClick={() => setFilter(p)} className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${filter === p ? 'bg-[#BF0A30] text-white' : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600'}`}>
            {p === 'all' ? 'All Notices' : p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-4">
        {filtered.map(notice => {
          const cfg = priorityConfig[notice.priority];
          return (
            <div key={notice.id} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 ${notice.priority === 'high' ? 'border-l-red-500' : notice.priority === 'medium' ? 'border-l-amber-500' : 'border-l-gray-300'} border border-gray-200 dark:border-[#2D2D2D] p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                  <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${cfg.color}`}>
                    {notice.priority === 'high' && <AlertTriangle className="w-3 h-3" />}{cfg.label}
                  </span>
                </div>
                <button onClick={() => removeNotice(notice.id)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{notice.content}</p>
              <p className="text-xs text-gray-400">{new Date(notice.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          );
        })}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notices found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Post Notice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea rows={4} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title || !form.content} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">{saving ? 'Posting…' : 'Post'}</button>
            </div>
          </div>
        </div>
      )}
    </DepartmentLayout>
  );
}
