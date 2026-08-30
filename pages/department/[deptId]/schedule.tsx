import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Plus, Clock, MapPin, Trash2, Loader2 } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { useDepartment } from '@/hooks/useDepartment';
import { supabase } from '@/lib/supabase';

interface EventRow { id: string; title: string; description: string | null; event_date: string; start_time: string | null; location: string | null }

export default function DepartmentSchedulePage() {
  const router = useRouter();
  const { deptId } = router.query as { deptId?: string };
  const { department, loading: deptLoading } = useDepartment(deptId);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '', description: '' });

  const load = useCallback(async () => {
    if (!deptId) return;
    setLoading(true);
    const { data } = await supabase.from('events').select('id, title, description, event_date, start_time, location').eq('type', 'department').eq('department_id', deptId).order('event_date', { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  }, [deptId]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!deptId || !form.title || !form.date) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('events').insert({
      title: form.title, description: form.description || null, type: 'department', department_id: deptId,
      event_date: form.date, start_time: form.time || null, location: form.venue || null, status: 'upcoming',
      created_by: session?.user.id ?? null,
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ title: '', date: '', time: '', venue: '', description: '' });
    load();
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this schedule entry?')) return;
    await supabase.from('events').delete().eq('id', id);
    load();
  }

  if (deptLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = events.filter(e => e.event_date < today);

  return (
    <DepartmentLayout department={department} title="Schedule">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Schedule</h1>
          <p className="text-gray-500">Manage service schedules and events</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />Add Schedule
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming ({upcoming.length})</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-8 text-center text-gray-500">No upcoming schedule entries</div>
          ) : upcoming.map(event => (
            <div key={event.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 text-center flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-[#252525] rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Date(event.event_date).getDate()}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                    <button onClick={() => deleteEvent(event.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {event.description && <p className="text-sm text-gray-500 mb-2">{event.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {event.start_time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.start_time}</span>}
                    {event.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {past.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Past ({past.length})</h2>
            {past.map(event => (
              <div key={event.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 opacity-75">
                <div className="flex items-start gap-4">
                  <div className="w-16 text-center flex-shrink-0">
                    <div className="bg-gray-100 dark:bg-[#252525] rounded-xl p-3">
                      <p className="text-xs text-gray-500 uppercase">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{new Date(event.event_date).getDate()}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300">{event.title}</p>
                    {event.location && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{event.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Add Schedule Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input type="text" placeholder="e.g. 7:30 AM - 10:00 AM" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue</label>
                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <textarea rows={2} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.title || !form.date} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">{saving ? 'Saving…' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </DepartmentLayout>
  );
}
