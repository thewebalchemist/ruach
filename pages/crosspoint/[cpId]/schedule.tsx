import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Plus, Calendar, Clock, MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { useCrosspoint } from '@/hooks/useCrosspoint';
import { supabase } from '@/lib/supabase';

interface Meeting {
  id: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
  title: string;
  description: string | null;
}

export default function CrosspointSchedulePage() {
  const router = useRouter();
  const { cpId } = router.query as { cpId?: string };
  const { crosspoint, loading: cpLoading } = useCrosspoint(cpId);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', topic: '', venue: '', notes: '' });

  const load = useCallback(async () => {
    if (!cpId) return;
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('id, event_date, start_time, location, title, description')
      .eq('type', 'crosspoint')
      .eq('crosspoint_id', cpId)
      .order('event_date', { ascending: false });
    setMeetings(data ?? []);
    setLoading(false);
  }, [cpId]);

  useEffect(() => { load(); }, [load]);

  if (cpLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = meetings.filter(m => m.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = meetings.filter(m => m.event_date < today);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  function getMonthAbbr(dateStr: string) { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }); }
  function getDay(dateStr: string) { return new Date(dateStr).getDate(); }

  async function handleAdd() {
    if (!cpId || !form.date || !form.topic || !crosspoint) return;
    setSaving(true);
    await supabase.from('events').insert({
      title: form.topic,
      description: form.notes || null,
      type: 'crosspoint',
      crosspoint_id: cpId,
      event_date: form.date,
      start_time: form.time || null,
      location: form.venue || crosspoint.venue,
      status: 'upcoming',
    });
    setSaving(false);
    setShowAddModal(false);
    setForm({ date: '', time: '', topic: '', venue: '', notes: '' });
    load();
  }

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Schedule">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meeting Schedule</h1>
          <p className="text-gray-500">Weekly meetings every {crosspoint.meetingDay} at {crosspoint.meetingTime}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
        >
          <Plus className="w-4 h-4" />Add Meeting
        </button>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Regular Meeting Details</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-[#BF0A30]" />
            </div>
            <div><p className="text-xs text-gray-500">Day</p><p className="font-medium text-gray-900 dark:text-white">{crosspoint.meetingDay}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#BF0A30]" />
            </div>
            <div><p className="text-xs text-gray-500">Time</p><p className="font-medium text-gray-900 dark:text-white">{crosspoint.meetingTime}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#BF0A30]" />
            </div>
            <div><p className="text-xs text-gray-500">Venue</p><p className="font-medium text-gray-900 dark:text-white">{crosspoint.venue}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D] flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
          <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">{upcoming.length} scheduled</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {upcoming.map(meeting => (
            <div key={meeting.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#252525]">
              <div className="w-14 h-14 rounded-xl bg-[#BF0A30]/10 flex flex-col items-center justify-center flex-shrink-0">
                <p className="text-xs text-[#BF0A30] font-medium">{getMonthAbbr(meeting.event_date)}</p>
                <p className="text-xl font-bold text-[#BF0A30]">{getDay(meeting.event_date)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{meeting.title}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                  {meeting.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.start_time}</span>}
                  {meeting.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{meeting.location}</span>}
                </div>
                {meeting.description && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{meeting.description}</p>}
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full flex-shrink-0">Upcoming</span>
            </div>
          ))}
          {upcoming.length === 0 && <div className="p-12 text-center text-gray-500">No upcoming meetings scheduled</div>}
        </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
        <button onClick={() => setShowPast(!showPast)} className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
          <h2 className="font-semibold text-gray-900 dark:text-white">Past Meetings ({past.length})</h2>
          {showPast ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {showPast && (
          <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
            {past.map(meeting => (
              <div key={meeting.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#252525] opacity-75">
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-[#252525] flex flex-col items-center justify-center flex-shrink-0">
                  <p className="text-xs text-gray-500 font-medium">{getMonthAbbr(meeting.event_date)}</p>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{getDay(meeting.event_date)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 dark:text-gray-300">{meeting.title}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                    {meeting.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.start_time}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(meeting.event_date)}</span>
                  </div>
                  {meeting.description && <p className="text-xs text-gray-500 mt-1">{meeting.description}</p>}
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-[#2D2D2D] text-gray-600 dark:text-gray-400 rounded-full flex-shrink-0">Past</span>
              </div>
            ))}
            {past.length === 0 && <div className="p-12 text-center text-gray-500">No past meetings recorded</div>}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Add Meeting</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input type="time" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                <input type="text" placeholder="Meeting topic" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input type="text" placeholder={crosspoint.venue} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <textarea rows={2} placeholder="Any notes for members..." className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.date || !form.topic} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">{saving ? 'Saving…' : 'Add Meeting'}</button>
            </div>
          </div>
        </div>
      )}
    </CrosspointLayout>
  );
}
