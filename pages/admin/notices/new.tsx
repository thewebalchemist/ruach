import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Bell } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface DropdownItem {
  id: string;
  name: string;
}

export default function NewNoticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);
  const [crosspoints, setCrosspoints] = useState<DropdownItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scope: 'all',
    target_id: '',
    priority: 'medium',
    expires_at: '',
  });

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
    if (!profile || !['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadDropdowns();
  }

  async function loadDropdowns() {
    const [deptRes, cpRes] = await Promise.all([
      supabase.from('departments').select('id, name').order('name'),
      supabase.from('crosspoints').select('id, name').eq('status', 'active').order('name'),
    ]);
    if (deptRes.data) setDepartments(deptRes.data);
    if (cpRes.data) setCrosspoints(cpRes.data);
    setPageLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
        scope: formData.scope,
        target_id: formData.target_id || null,
        priority: formData.priority,
        expires_at: formData.expires_at || null,
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.push('/admin/notices');
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create notice');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (pageLoading) {
    return (
      <AdminLayout title="Create Notice">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Create Notice">
      <div className="max-w-3xl">
        <Link href="/admin/notices" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Notices
        </Link>

        <PageHeader title="Create Notice" subtitle="Send an announcement to the congregation" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notice Content */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Notice Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Notice title..." className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Content *</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={5} required placeholder="Write your announcement here..." className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg resize-none" />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Audience</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Scope *</label>
                <select name="scope" value={formData.scope} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                  <option value="all">All (Church-wide)</option>
                  <option value="members">Members Only</option>
                  <option value="leaders">Leaders Only</option>
                  <option value="department">Specific Department</option>
                  <option value="crosspoint">Specific Crosspoint</option>
                </select>
              </div>
              {formData.scope === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Department</label>
                  <select name="target_id" value={formData.target_id} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              {formData.scope === 'crosspoint' && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Crosspoint</label>
                  <select name="target_id" value={formData.target_id} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                    <option value="">Select crosspoint...</option>
                    {crosspoints.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Priority & Expiry */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Expires On</label>
                <input type="date" name="expires_at" value={formData.expires_at} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.title && (
            <div className="bg-white/[0.04] rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Preview</h3>
              <div className={`bg-[#12151C] rounded-lg p-4 border-l-4 ${formData.priority === 'high' ? 'border-l-red-500' : formData.priority === 'medium' ? 'border-l-amber-500' : 'border-l-gray-300'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-[#BF0A30]" />
                  <span className="font-semibold text-white">{formData.title}</span>
                </div>
                <p className="text-sm text-white/50 whitespace-pre-wrap">{formData.content}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/notices" className="px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-gray-50">Cancel</Link>
            <button type="button" className="px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-gray-50">Save as Draft</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />{loading ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
