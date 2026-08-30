import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface LeaderOption { id: string; first_name: string; last_name: string }

export default function EditDepartmentPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [leaders, setLeaders] = useState<LeaderOption[]>([]);
  const [form, setForm] = useState({ name: '', description: '', icon: '', leaderId: '' });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [deptRes, leadersRes] = await Promise.all([
      supabase.from('departments').select('name, description, icon, leader_id').eq('id', id).single(),
      supabase.from('profiles').select('id, first_name, last_name').in('role', ['leader', 'admin', 'pastor']).order('first_name'),
    ]);
    setLeaders(leadersRes.data ?? []);
    if (deptRes.data) {
      setForm({
        name: deptRes.data.name, description: deptRes.data.description ?? '',
        icon: deptRes.data.icon ?? '', leaderId: deptRes.data.leader_id ?? '',
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.from('departments').update({
      name: form.name, description: form.description || null, icon: form.icon || null,
      leader_id: form.leaderId || null,
    }).eq('id', id);
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    router.push(`/admin/departments/${id}`);
  }

  if (loading) {
    return <AdminLayout title="Edit Department"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title={`Edit ${form.name}`}>
      <div className="max-w-2xl">
        <Link href={`/admin/departments/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Department
        </Link>
        <PageHeader title={`Edit ${form.name}`} subtitle="Update department details" />

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input type="text" required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea rows={3} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
              <input type="text" placeholder="🎵" className="w-24 px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white text-center text-xl" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Head of Department</label>
              <select className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.leaderId} onChange={e => setForm(f => ({ ...f, leaderId: e.target.value }))}>
                <option value="">None</option>
                {leaders.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={`/admin/departments/${id}`} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Cancel</Link>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
