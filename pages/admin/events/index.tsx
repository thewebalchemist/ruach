import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  event_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  image_url: string | null;
  is_public: boolean;
  chatbot_enabled: boolean;
  created_at: string;
}

export default function EventsPage() {
  const { loading: authLoading, authHeaders } = useAdminAuth();
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    fetchEvents();
  }, [authLoading]);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });
    if (!error && data) setEvents(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const headers = authHeaders();
    await fetch(`/api/control-panel/events?id=${id}`, { method: 'DELETE', headers });
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const filtered = events.filter(e => filter === 'all' || e.category === filter);
  const now = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.event_date >= now).length;
  const churchWide = events.filter(e => e.category === 'church-wide').length;
  const department = events.filter(e => e.category === 'department').length;

  if (authLoading || loading) {
    return (
      <AdminLayout title="Events">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Events">
      <PageHeader
        title="Events"
        subtitle={`${upcoming} upcoming events`}
        actions={<Link href="/admin/events/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"><Plus className="w-4 h-4" />Create Event</Link>}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-white">{upcoming}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Church-wide</p>
          <p className="text-2xl font-bold text-white">{churchWide}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Department</p>
          <p className="text-2xl font-bold text-white">{department}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Total Events</p>
          <p className="text-2xl font-bold text-white">{events.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
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
              filter === tab.id
                ? 'bg-[#BF0A30] text-white'
                : 'bg-[#12151C] border border-white/[0.06] text-white/50 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filtered.map((event) => {
          const eventDate = new Date(event.event_date);
          const isUpcoming = event.event_date >= now;
          return (
            <div key={event.id} className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
              <div className="flex gap-4">
                {/* Date Box */}
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="bg-[#BF0A30]/10 rounded-xl p-3">
                    <p className="text-xs font-medium text-[#BF0A30] uppercase">
                      {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-bold text-[#BF0A30]">
                      {eventDate.getDate()}
                    </p>
                  </div>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          event.category === 'church-wide' ? 'bg-[#BF0A30] text-white' : 'bg-white/10 text-white/70'
                        }`}>{event.category}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          isUpcoming ? 'bg-green-100 text-green-800' : 'bg-white/5 text-gray-700'
                        }`}>{isUpcoming ? 'upcoming' : 'past'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/admin/events/${event.id}`} className="p-2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></Link>
                      <Link href={`/admin/events/${event.id}/edit`} className="p-2 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-white/50">
                    {event.start_time && (
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </AdminLayout>
  );
}
