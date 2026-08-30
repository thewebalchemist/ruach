import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Bell } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Option { id: string; name: string }

export default function NewNoticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<Option[]>([]);
  const [crosspoints, setCrosspoints] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    title: '', content: '', scope: 'all', targetId: '', priority: 'medium', expiresAt: '',
  });

  useEffect(() => {
    supabase.from('departments').select('id, name').order('name').then(({ data }) => setDepartments(data ?? []));
    supabase.from('crosspoints').select('id, name').eq('status', 'active').order('name').then(({ data }) => setCrosspoints(data ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    const { error: insertError } = await supabase.from('notices').insert({
      title: formData.title,
      content: formData.content,
      scope: formData.scope,
      target_id: (formData.scope === 'department' || formData.scope === 'crosspoint') ? (formData.targetId || null) : null,
      priority: formData.priority,
      expires_at: formData.expiresAt || null,
      author_id: session?.user.id ?? null,
    });
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push('/admin/notices');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AdminLayout title="Create Notice">
      <div className="max-w-3xl">
        <Link href="/admin/notices" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Notices
        </Link>

        <PageHeader title="Create Notice" subtitle="Send an announcement to the congregation" />

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Notice Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Notice title..." className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={5} required placeholder="Write your announcement here..." className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Audience</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope *</label>
                <select name="scope" value={formData.scope} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="all">All (Church-wide)</option>
                  <option value="members">Members Only</option>
                  <option value="leaders">Leaders Only</option>
                  <option value="department">Specific Department</option>
                  <option value="crosspoint">Specific Crosspoint</option>
                </select>
              </div>
              {formData.scope === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <select name="targetId" value={formData.targetId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              {formData.scope === 'crosspoint' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crosspoint</label>
                  <select name="targetId" value={formData.targetId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                    <option value="">Select crosspoint...</option>
                    {crosspoints.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires On</label>
                <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>
            </div>
          </div>

          {formData.title && (
            <div className="bg-gray-50 dark:bg-[#252525] rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Preview</h3>
              <div className={`bg-white dark:bg-[#1A1A1A] rounded-lg p-4 border-l-4 ${formData.priority === 'high' ? 'border-l-red-500' : formData.priority === 'medium' ? 'border-l-amber-500' : 'border-l-gray-300'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-[#BF0A30]" />
                  <span className="font-semibold text-gray-900 dark:text-white">{formData.title}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{formData.content}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/notices" className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={loading || !formData.title || !formData.content} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />{loading ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
