// pages/admin/crosspoints/modules/index.tsx
// Admin: manage crosspoint curriculum series (crosspoint_modules) — create, publish, archive

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, CheckCircle, Clock, Archive, Users, Search, Loader2, X } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

type ModuleStatus = 'draft' | 'published' | 'archived';

interface ModuleRow {
  id: string; title: string; series_name: string | null; description: string | null;
  status: ModuleStatus; total_weeks: number; scripture_ref: string | null; published_at: string | null;
}

const STATUS_CONFIG: Record<ModuleStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  published: { label: 'Published', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
  draft:     { label: 'Draft',     color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  archived:  { label: 'Archived',  color: 'text-gray-600 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-[#2D2D2D]',     icon: Archive },
};

export default function CrosspointModulesPage() {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [activeCrosspoints, setActiveCrosspoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ModuleStatus>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', series_name: '', description: '', scripture_ref: '', total_weeks: '4' });

  const load = useCallback(async () => {
    setLoading(true);
    const [modulesRes, cpRes] = await Promise.all([
      supabase.from('crosspoint_modules').select('id, title, series_name, description, status, total_weeks, scripture_ref, published_at').order('created_at', { ascending: false }),
      supabase.from('crosspoints').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);
    setModules(modulesRes.data ?? []);
    setActiveCrosspoints(cpRes.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = modules.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !(m.series_name ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const published = modules.filter(m => m.status === 'published').length;
  const drafts = modules.filter(m => m.status === 'draft').length;

  async function handleCreate() {
    if (!form.title) return;
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data } = await supabase.from('crosspoint_modules').insert({
      title: form.title,
      series_name: form.series_name || null,
      description: form.description || null,
      scripture_ref: form.scripture_ref || null,
      total_weeks: parseInt(form.total_weeks, 10) || 4,
      created_by: session?.user.id ?? null,
    }).select('id').single();
    setCreating(false);
    setShowCreate(false);
    setForm({ title: '', series_name: '', description: '', scripture_ref: '', total_weeks: '4' });
    if (data) window.location.href = `/admin/crosspoints/modules/${data.id}`;
  }

  return (
    <AdminLayout title="Crosspoint Modules">
      <PageHeader
        title="Crosspoint Modules"
        subtitle={`Weekly study curriculum shared to ${activeCrosspoints} active crosspoints`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Create Module
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Series', value: modules.length, icon: BookOpen, color: 'text-[#BF0A30]', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Published', value: published, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Drafts', value: drafts, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Active Crosspoints', value: activeCrosspoints, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#12151C] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules…" className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft', 'archived'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${
                filter === f ? 'bg-[#BF0A30] text-white' : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {f === 'all' ? `All (${modules.length})` : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No modules found</p>
            <p className="text-sm text-gray-400">Try adjusting the filter or search</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map(module => {
              const statusCfg = STATUS_CONFIG[module.status];
              const StatusIcon = statusCfg.icon;
              return (
                <Link
                  key={module.id}
                  href={`/admin/crosspoints/modules/${module.id}`}
                  className="flex items-start gap-4 p-5 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] flex flex-col items-center justify-center font-black text-sm flex-shrink-0 text-gray-600 dark:text-gray-400">
                    <span className="text-[10px] font-semibold opacity-70">WKS</span>
                    <span className="text-lg leading-none">{module.total_weeks}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">{module.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />{statusCfg.label}
                      </span>
                    </div>
                    {module.series_name && <p className="text-sm text-[#BF0A30] font-medium mb-1">{module.series_name}</p>}
                    {module.description && <p className="text-sm text-gray-500 truncate">{module.description}</p>}
                    {module.published_at && (
                      <p className="text-xs text-gray-400 mt-1">Published {new Date(module.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Module</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" placeholder="e.g. Walking in Purpose" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Series Name</label>
                <input type="text" placeholder="e.g. Foundations of Faith" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.series_name} onChange={e => setForm(f => ({ ...f, series_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scripture Reference</label>
                <input type="text" placeholder="e.g. Jeremiah 29:11" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.scripture_ref} onChange={e => setForm(f => ({ ...f, scripture_ref: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Weeks</label>
                <input type="number" min={1} max={20} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.total_weeks} onChange={e => setForm(f => ({ ...f, total_weeks: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={2} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">{creating ? 'Creating…' : 'Create & Add Weeks'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
