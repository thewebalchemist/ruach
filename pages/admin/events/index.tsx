import { useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, Clock, Eye, Edit, Filter } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { mockEvents } from '@/data';

export default function EventsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = mockEvents.filter(e => filter === 'all' || e.type === filter);
  const upcoming = mockEvents.filter(e => e.status === 'upcoming').length;

  return (
    <AdminLayout title="Events">
      <PageHeader 
        title="Events" 
        subtitle={`${upcoming} upcoming events`}
        actions={<Link href="/admin/events/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"><Plus className="w-4 h-4" />Create Event</Link>}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcoming}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Church-wide</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockEvents.filter(e => e.type === 'church-wide').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Department</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockEvents.filter(e => e.type === 'department').length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Registered</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockEvents.reduce((s, e) => s + e.registeredCount, 0)}</p>
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
                : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filtered.map((event) => (
          <div key={event.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex gap-4">
              {/* Date Box */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="bg-[#BF0A30]/10 rounded-xl p-3">
                  <p className="text-xs font-medium text-[#BF0A30] uppercase">
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-[#BF0A30]">
                    {new Date(event.startDate).getDate()}
                  </p>
                </div>
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        event.type === 'church-wide' ? 'bg-[#BF0A30] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>{event.type}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}>{event.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/events/${event.id}`} className="p-2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></Link>
                    <Link href={`/admin/events/${event.id}/edit`} className="p-2 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></Link>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.venue}</span>
                  {event.capacity && (
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{event.registeredCount}/{event.capacity} registered</span>
                  )}
                </div>

                {event.requiresRegistration && event.capacity && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Registration</span>
                      <span>{Math.round((event.registeredCount / event.capacity) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-[#2D2D2D] rounded-full overflow-hidden">
                      <div className="h-full bg-[#BF0A30] rounded-full" style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </AdminLayout>
  );
}
