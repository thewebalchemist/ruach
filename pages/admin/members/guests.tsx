import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Phone, Mail, Calendar, UserPlus, Check, Clock, MessageSquare } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { mockGuests } from '@/data';

export default function GuestsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockGuests.filter(g => {
    const matchesSearch = `${g.firstName} ${g.lastName} ${g.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || g.followUpStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockGuests.length,
    pending: mockGuests.filter(g => g.followUpStatus === 'pending').length,
    contacted: mockGuests.filter(g => g.followUpStatus === 'contacted').length,
    converted: mockGuests.filter(g => g.followUpStatus === 'converted').length,
  };

  return (
    <AdminLayout title="Guests">
      <PageHeader 
        title="Guest Management" 
        subtitle={`${stats.pending} guests need follow-up`}
        actions={<Link href="/admin/members/guests/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg"><Plus className="w-4 h-4" />Add Guest</Link>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Guests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-amber-500 border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Pending Follow-up</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-blue-500 border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Contacted</p>
          <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-green-500 border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Converted</p>
          <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search guests..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Guests List */}
      <div className="space-y-4">
        {filtered.map((guest) => (
          <div key={guest.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#2D2D2D] flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold">
                  {guest.firstName[0]}{guest.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{guest.firstName} {guest.lastName}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{guest.phone}</span>
                    {guest.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{guest.email}</span>}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                guest.followUpStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                guest.followUpStatus === 'contacted' ? 'bg-blue-100 text-blue-800' :
                guest.followUpStatus === 'converted' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>{guest.followUpStatus}</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Visited: {new Date(guest.visitDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <UserPlus className="w-4 h-4" />
                <span>Source: {guest.source}</span>
              </div>
              {guest.invitedBy && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>Invited by member</span>
                </div>
              )}
            </div>

            {guest.notes && (
              <div className="bg-gray-50 dark:bg-[#252525] rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{guest.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
              {guest.followUpStatus === 'pending' && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">
                    <Phone className="w-4 h-4" />Mark Contacted
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50">
                    <MessageSquare className="w-4 h-4" />Add Note
                  </button>
                </>
              )}
              {guest.followUpStatus === 'contacted' && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Check className="w-4 h-4" />Convert to Attendee
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Clock className="w-4 h-4" />Schedule Follow-up
                  </button>
                </>
              )}
              <Link href={`/admin/members/guests/${guest.id}`} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">View Details</Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No guests found</p>
        </div>
      )}
    </AdminLayout>
  );
}
