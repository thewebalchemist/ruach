import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Plus, Calendar, Edit, Trash2, Save, X, Loader2,
  AlertCircle, CheckCircle, Search, MapPin, Clock, LayoutList, Link as LinkIcon, Image,
} from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';

interface DBEvent {
  id: number;
  title: string;
  event_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  link_label: string | null;
  is_public: boolean;
  chatbot_enabled: boolean;
  category?: string;
}

const EMPTY_FORM = {
  title: '',
  event_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  location: '',
  description: '',
  image_url: '',
  link_url: '',
  link_label: 'Register Now',
  is_public: true,
  chatbot_enabled: true,
  category: 'church-wide',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

function CalendarView({ events, onDayClick }: { events: DBEvent[]; onDayClick: (date: string) => void }) {
  const todayDate = new Date();
  const [year, setYear]   = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth());

  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMo  = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const evByDay: Record<number, DBEvent[]> = {};
  events.forEach(ev => {
    const d = new Date(ev.event_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!evByDay[day]) evByDay[day] = [];
      evByDay[day].push(ev);
    }
  });

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] text-gray-500 dark:text-gray-400 text-xl transition-colors">‹</button>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{monthName}</span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] text-gray-500 dark:text-gray-400 text-xl transition-colors">›</button>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-[#2A2A2A]">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} className="h-20 border-b border-r border-gray-50 dark:border-[#222]" />
        ))}
        {Array.from({ length: daysInMo }, (_, i) => i + 1).map(day => {
          const isToday = year === todayDate.getFullYear() && month === todayDate.getMonth() && day === todayDate.getDate();
          const dayEvs  = evByDay[day] ?? [];
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return (
            <div key={day} onClick={() => onDayClick(dateStr)}
              className={`h-20 border-b border-r border-gray-50 dark:border-[#222] p-1 flex flex-col cursor-pointer group transition-colors hover:bg-gray-50 dark:hover:bg-[#222] ${isToday ? 'bg-[#BF0A30]/5 dark:bg-[#BF0A30]/10' : ''}`}>
              <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1 flex-shrink-0 ${isToday ? 'bg-[#BF0A30] text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                {day}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvs.slice(0, 2).map(ev => (
                  <span key={ev.id} className="text-[9px] font-semibold bg-[#BF0A30]/10 text-[#BF0A30] rounded px-1 truncate leading-tight py-0.5">
                    {ev.title}
                  </span>
                ))}
                {dayEvs.length > 2 && <span className="text-[9px] text-gray-400 dark:text-gray-600">+{dayEvs.length - 2}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EventsCP() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DBEvent | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    checkAuth();
    if (router.query.action === 'new') setShowForm(true);
  }, [router.query]);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=/control-panel/events'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single() as any;
    if (!profile || !['admin', 'pastor'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }

  async function loadData() {
    const { data } = await (supabase.from('events') as any)
      .select('id, title, event_date, end_date, start_time, end_time, location, description, image_url, link_url, link_label, is_public, chatbot_enabled, category')
      .order('event_date', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  function openNew(date?: string) {
    setEditing(null);
    setForm({ ...EMPTY_FORM, event_date: date ?? new Date().toISOString().split('T')[0] });
    setError('');
    setShowForm(true);
  }

  function openEdit(ev: DBEvent) {
    setEditing(ev);
    setForm({
      title:            ev.title,
      event_date:       ev.event_date,
      end_date:         ev.end_date || '',
      start_time:       ev.start_time || '',
      end_time:         ev.end_time || '',
      location:         ev.location || '',
      description:      ev.description || '',
      image_url:        ev.image_url || '',
      link_url:         ev.link_url || '',
      link_label:       ev.link_label || 'Register Now',
      is_public:        ev.is_public,
      chatbot_enabled:  ev.chatbot_enabled,
      category:         ev.category || 'church-wide',
    });
    setError('');
    setShowForm(true);
  }

  function set<K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.title || !form.event_date) { setError('Title and date are required.'); return; }
    setSaving(true); setError('');
    const payload: Record<string, unknown> = {
      title:           form.title,
      event_date:      form.event_date,
      end_date:        form.end_date || null,
      start_time:      form.start_time || null,
      end_time:        form.end_time || null,
      location:        form.location || null,
      description:     form.description || null,
      image_url:       form.image_url || null,
      link_url:        form.link_url || null,
      link_label:      form.link_label || null,
      is_public:       form.is_public,
      chatbot_enabled: form.chatbot_enabled,
      category:        form.category,
    };

    let err: { message: string } | null = null;
    if (editing) {
      ({ error: err } = await (supabase.from('events') as any).update(payload).eq('id', editing.id));
    } else {
      ({ error: err } = await (supabase.from('events') as any).insert(payload));
    }

    setSaving(false);
    if (err) {
      // If link_url / link_label columns don't exist yet, retry without them
      if (err.message?.includes('link_url') || err.message?.includes('link_label')) {
        delete payload.link_url;
        delete payload.link_label;
        let err2: { message: string } | null = null;
        if (editing) {
          ({ error: err2 } = await (supabase.from('events') as any).update(payload).eq('id', editing.id));
        } else {
          ({ error: err2 } = await (supabase.from('events') as any).insert(payload));
        }
        if (err2) { setError(err2.message); return; }
        setError('⚠️ Event saved but CTA link was ignored — add link_url & link_label columns to your events table in Supabase.');
      } else {
        setError(err.message); return;
      }
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); loadData(); }, 1800);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    await (supabase.from('events') as any).delete().eq('id', id);
    loadData();
  }

  const today = new Date().toISOString().split('T')[0];
  const filtered = events
    .filter(e => {
      if (filter === 'upcoming') return e.event_date >= today;
      if (filter === 'past') return e.event_date < today;
      return true;
    })
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <CPLayout
      title="Events"
      subtitle={`${events.filter(e => e.event_date >= today).length} upcoming`}
      actions={
        <button onClick={() => openNew()} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white text-sm font-semibold rounded-xl hover:bg-[#A00828] transition-colors">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      }
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
        </div>
        <div className="flex gap-2">
          {view === 'list' && (
            <div className="flex gap-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-xl p-1">
              {(['upcoming', 'past', 'all'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{f}</button>
              ))}
            </div>
          )}
          <div className="flex gap-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-xl p-1">
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${view === 'list' ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              <LayoutList className="w-3.5 h-3.5" /> List
            </button>
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${view === 'calendar' ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" /></div>
      ) : view === 'calendar' ? (
        <CalendarView events={events} onDayClick={(date) => openNew(date)} />
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] py-16 text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No events found.</p>
              <button onClick={() => openNew()} className="mt-3 text-sm text-[#BF0A30] font-medium hover:underline">Add an event →</button>
            </div>
          ) : filtered.map(e => {
            const isPast = e.event_date < today;
            return (
              <div key={e.id} className={`flex items-start gap-4 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] px-4 py-4 ${isPast ? 'opacity-60' : ''}`}>
                {e.image_url ? (
                  <img src={e.image_url} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-gray-100" onError={(el) => { (el.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-14 h-14 bg-[#0891B2]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-[#0891B2]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{e.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(e.event_date)}{e.start_time ? ` · ${e.start_time}` : ''}{e.end_time ? `–${e.end_time}` : ''}</span>
                    {e.location && <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>}
                    {e.link_url && <span className="text-xs text-blue-500 flex items-center gap-1"><LinkIcon className="w-3 h-3" />{e.link_label || 'CTA link'}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {e.chatbot_enabled && <span className="hidden sm:inline text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">AI</span>}
                  <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] rounded-t-2xl">
              <h2 className="font-bold text-gray-900 dark:text-white">{editing ? 'Edit Event' : 'Add New Event'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* Title */}
              <div>
                <label className={lbl}>Event Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. The Charge 2026 — Men's Conference" className={inp} />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Start Date *</label>
                  <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>End Date <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
                  <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={inp} />
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>End Time</label>
                  <input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} className={inp} />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={lbl}>Location</label>
                <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Ruach Tabernacle / Online (Zoom)" className={inp} />
              </div>

              {/* Category */}
              <div>
                <label className={lbl}>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={inp}>
                  <option value="church-wide">Church-wide</option>
                  <option value="department">Department</option>
                  <option value="crosspoint">Crosspoint</option>
                  <option value="special">Special Event</option>
                  <option value="prayer">Prayer</option>
                  <option value="conference">Conference</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={lbl}>Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the event…" className={`${inp} resize-none`} />
              </div>

              {/* Image URL */}
              <div>
                <label className={lbl}><Image className="inline w-3.5 h-3.5 mr-1" />Event Image URL</label>
                <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="/events/the-charge-2026.jpg or https://..." className={inp} />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl" onError={(el) => { (el.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <p className="text-[11px] text-gray-400 mt-1">Save your image to <code className="bg-gray-100 dark:bg-[#222] px-1 rounded">/public/events/</code> then use <code className="bg-gray-100 dark:bg-[#222] px-1 rounded">/events/filename.jpg</code></p>
              </div>

              {/* CTA Link */}
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Call-to-Action Button</p>
                <div>
                  <label className={lbl}>Button Label</label>
                  <input value={form.link_label} onChange={e => set('link_label', e.target.value)} placeholder="Register Now / Join Zoom / Learn More" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Button URL</label>
                  <input type="url" value={form.link_url} onChange={e => set('link_url', e.target.value)} placeholder="https://forms.gle/... or https://zoom.us/..." className={inp} />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => set('chatbot_enabled', !form.chatbot_enabled)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.chatbot_enabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-[#333]'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.chatbot_enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show in Ask Ruach AI <span className="text-xs text-gray-400">(recommended)</span>
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => set('is_public', !form.is_public)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_public ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#333]'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_public ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public event (visible on the website)</span>
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || saved} className="flex items-center gap-2 px-5 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : saved ? 'Saved!' : editing ? 'Save Changes' : 'Add Event'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 dark:border-[#333] text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CPLayout>
  );
}
