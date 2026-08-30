import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, Clock, Trash2, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface EventRow {
  id: string; title: string; description: string | null; type: string; status: string;
  event_date: string; start_time: string | null; location: string | null; capacity: number | null;
  requires_registration: boolean; registered_count: number;
}

export default function EventsPage() {
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('id, title, description, type, status, event_date, start_time, location, capacity, requires_registration, registered_count').order('event_date', { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = events.filter(e => filter === 'all' || e.type === filter);
  const upcoming = events.filter(e => e.status === 'upcoming').length;

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    await supabase.from('events').delete().eq('id', id);
    load();
  }

  return (
    <AdminLayout title="Events">
      <PageHeader
        title="Events"
        subtitle={`${upcoming} upcoming events`}
        actions={<Link href="/admin/events/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"><Plus className="w-4 h-4" />Create Event</Link>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcoming}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Church-wide</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.filter(e => e.type === 'church-wide').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Department</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.filter(e => e.type === 'department').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Registered</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.reduce((s, e) => s + e.registered_count, 0)}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'church-wide', label: 'Church-wide' },
          { id: 'department', label: 'Department' },
          { id: 'crosspoint', label: 'Crosspoint' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === tab.id ? 'bg-[#BF0A30] text-white' : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-4">
        {filtered.map((event) => (
          <div key={event.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="bg-[#BF0A30]/10 rounded-xl p-3">
                  <p className="text-xs font-medium text-[#BF0A30] uppercase">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                  <p className="text-2xl font-bold text-[#BF0A30]">{new Date(event.event_date).getDate()}</p>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${event.type === 'church-wide' ? 'bg-[#BF0A30] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{event.type}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{event.status}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteEvent(event.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>

                {event.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {event.start_time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.start_time}</span>}
                  {event.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</span>}
                  {event.capacity && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{event.registered_count}/{event.capacity} registered</span>}
                </div>

                {event.requires_registration && event.capacity && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Registration</span><span>{Math.round((event.registered_count / event.capacity) * 100)}%</span></div>
                    <div className="h-2 bg-gray-100 dark:bg-[#2D2D2D] rounded-full overflow-hidden">
                      <div className="h-full bg-[#BF0A30] rounded-full" style={{ width: `${Math.min((event.registered_count / event.capacity) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </AdminLayout>
  );
}
