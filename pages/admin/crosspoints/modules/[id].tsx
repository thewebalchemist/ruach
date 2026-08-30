// pages/admin/crosspoints/modules/[id].tsx
// Admin: edit a module's details, manage its weekly content, and assign it to crosspoints

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, Globe, Archive, Users, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface ModuleDetail {
  id: string; title: string; series_name: string | null; description: string | null;
  status: 'draft' | 'published' | 'archived'; total_weeks: number; scripture_ref: string | null;
}
interface Week {
  id: string; week_number: number; title: string; scripture: string | null;
  lesson_content: string; discussion_qs: string[]; prayer_points: string[]; leader_tips: string | null;
}

export default function CrosspointModuleDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignedCount, setAssignedCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [modRes, weeksRes, progressRes] = await Promise.all([
      supabase.from('crosspoint_modules').select('id, title, series_name, description, status, total_weeks, scripture_ref').eq('id', id).single(),
      supabase.from('crosspoint_module_weeks').select('id, week_number, title, scripture, lesson_content, discussion_qs, prayer_points, leader_tips').eq('module_id', id).order('week_number'),
      supabase.from('crosspoint_module_progress').select('id', { count: 'exact', head: true }).eq('module_id', id).is('completed_at', null),
    ]);
    setModule(modRes.data ?? null);
    setWeeks(weeksRes.data ?? []);
    setAssignedCount(progressRes.count ?? 0);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function saveModule() {
    if (!module) return;
    setSaving(true);
    await supabase.from('crosspoint_modules').update({
      title: module.title, series_name: module.series_name, description: module.description,
      scripture_ref: module.scripture_ref, total_weeks: module.total_weeks,
    }).eq('id', module.id);
    setSaving(false);
  }

  async function setStatus(status: 'draft' | 'published' | 'archived') {
    if (!module) return;
    await supabase.from('crosspoint_modules').update({
      status, published_at: status === 'published' ? new Date().toISOString() : null,
    }).eq('id', module.id);
    setModule(m => m ? { ...m, status } : m);
  }

  async function deleteModule() {
    if (!module || !confirm('Delete this module and all its weekly content? This cannot be undone.')) return;
    await supabase.from('crosspoint_modules').delete().eq('id', module.id);
    router.push('/admin/crosspoints/modules');
  }

  async function addWeek() {
    if (!id) return;
    const nextWeekNumber = weeks.length > 0 ? Math.max(...weeks.map(w => w.week_number)) + 1 : 1;
    const { data } = await supabase.from('crosspoint_module_weeks').insert({
      module_id: id, week_number: nextWeekNumber, title: `Week ${nextWeekNumber}`,
    }).select('id, week_number, title, scripture, lesson_content, discussion_qs, prayer_points, leader_tips').single();
    if (data) {
      setWeeks(prev => [...prev, data]);
      setExpandedWeek(data.id);
    }
  }

  async function saveWeek(week: Week) {
    await supabase.from('crosspoint_module_weeks').update({
      title: week.title, scripture: week.scripture, lesson_content: week.lesson_content,
      discussion_qs: week.discussion_qs, prayer_points: week.prayer_points, leader_tips: week.leader_tips,
    }).eq('id', week.id);
  }

  async function deleteWeek(weekId: string) {
    if (!confirm('Delete this week?')) return;
    await supabase.from('crosspoint_module_weeks').delete().eq('id', weekId);
    setWeeks(prev => prev.filter(w => w.id !== weekId));
  }

  function updateWeekLocal(weekId: string, patch: Partial<Week>) {
    setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, ...patch } : w));
  }

  async function assignToAllActive() {
    if (!id) return;
    setAssigning(true);
    const { data: activeCrosspoints } = await supabase.from('crosspoints').select('id').eq('status', 'active');
    if (activeCrosspoints && activeCrosspoints.length > 0) {
      await supabase.from('crosspoint_module_progress').upsert(
        activeCrosspoints.map(cp => ({ crosspoint_id: cp.id, module_id: id, current_week: 1 })),
        { onConflict: 'crosspoint_id,module_id', ignoreDuplicates: true },
      );
    }
    setAssigning(false);
    load();
  }

  if (loading) {
    return <AdminLayout title="Module"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }
  if (!module) {
    return (
      <AdminLayout title="Module Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Module not found</p>
          <Link href="/admin/crosspoints/modules" className="text-[#BF0A30] hover:underline mt-4 inline-block">Back to Modules</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={module.title}>
      <div className="mb-6">
        <Link href="/admin/crosspoints/modules" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Modules
        </Link>
        <PageHeader
          title={module.title}
          subtitle={`${weeks.length} of ${module.total_weeks} weeks written · ${assignedCount ?? 0} crosspoints assigned`}
          actions={
            <div className="flex gap-2">
              {module.status !== 'published' && (
                <button onClick={() => setStatus('published')} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Globe className="w-4 h-4" />Publish
                </button>
              )}
              {module.status !== 'archived' && (
                <button onClick={() => setStatus('archived')} className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">
                  <Archive className="w-4 h-4" />Archive
                </button>
              )}
            </div>
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Module Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={module.title} onChange={e => setModule(m => m && { ...m, title: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Series Name</label>
                  <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={module.series_name ?? ''} onChange={e => setModule(m => m && { ...m, series_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scripture Reference</label>
                  <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={module.scripture_ref ?? ''} onChange={e => setModule(m => m && { ...m, scripture_ref: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={2} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={module.description ?? ''} onChange={e => setModule(m => m && { ...m, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Weeks</label>
                <input type="number" min={1} max={20} className="w-32 px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={module.total_weeks} onChange={e => setModule(m => m && { ...m, total_weeks: parseInt(e.target.value, 10) || 1 })} />
              </div>
              <div className="flex justify-end">
                <button onClick={saveModule} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
                  <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Weekly Content ({weeks.length})</h2>
              <button onClick={addWeek} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                <Plus className="w-4 h-4" />Add Week
              </button>
            </div>
            {weeks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No weekly content yet — click "Add Week" to start writing.</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {weeks.map(week => {
                  const expanded = expandedWeek === week.id;
                  return (
                    <div key={week.id}>
                      <button onClick={() => setExpandedWeek(expanded ? null : week.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#222]">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">{week.week_number}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{week.title}</span>
                        </div>
                        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      {expanded && (
                        <div className="px-4 pb-4 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                            <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={week.title} onChange={e => updateWeekLocal(week.id, { title: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Scripture</label>
                            <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={week.scripture ?? ''} onChange={e => updateWeekLocal(week.id, { scripture: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Lesson Content</label>
                            <textarea rows={4} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={week.lesson_content} onChange={e => updateWeekLocal(week.id, { lesson_content: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Discussion Questions (one per line)</label>
                            <textarea rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={week.discussion_qs.join('\n')} onChange={e => updateWeekLocal(week.id, { discussion_qs: e.target.value.split('\n').filter(Boolean) })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Prayer Points (one per line)</label>
                            <textarea rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={week.prayer_points.join('\n')} onChange={e => updateWeekLocal(week.id, { prayer_points: e.target.value.split('\n').filter(Boolean) })} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Leader's Tip</label>
                            <textarea rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={week.leader_tips ?? ''} onChange={e => updateWeekLocal(week.id, { leader_tips: e.target.value })} />
                          </div>
                          <div className="flex justify-between pt-2">
                            <button onClick={() => deleteWeek(week.id)} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" />Delete Week</button>
                            <button onClick={() => saveWeek(week)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"><Save className="w-4 h-4" />Save Week</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Assign to Crosspoints</h2>
            <p className="text-sm text-gray-500 mb-4">Puts every active crosspoint on week 1 of this module. Crosspoints already on this module are left untouched.</p>
            <button onClick={assignToAllActive} disabled={assigning || module.status !== 'published'} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Users className="w-4 h-4" />{assigning ? 'Assigning…' : 'Assign to All Active Crosspoints'}
            </button>
            {module.status !== 'published' && <p className="text-xs text-amber-600 mt-2">Publish this module before assigning it.</p>}
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-red-200 dark:border-red-900 p-6">
            <h2 className="font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
            <button onClick={deleteModule} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-red-300 text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10">
              <Trash2 className="w-4 h-4" />Delete Module
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
