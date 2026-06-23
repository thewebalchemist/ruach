import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Plus, Phone, Mail, Calendar, UserPlus, Check, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface GuestRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  visit_date: string;
  source: string;
  invited_by: string | null;
  follow_up_status: string;
  notes: string | null;
}

export default function GuestsPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=/admin/members/guests'); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) {
      router.push('/');
      return;
    }
    loadGuests();
  }, [authLoading, profile]);

  async function loadGuests() {
    setLoading(true);
    const { data } = await db.from('guests')
      .select('id, first_name, last_name, phone, email, visit_date, source, invited_by, follow_up_status, notes')
      .order('created_at', { ascending: false });
    setGuests((data ?? []) as GuestRow[]);
    setLoading(false);
  }

  async function updateGuestStatus(guestId: string, newStatus: string) {
    setActionLoading(guestId);
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    await fetch('/api/admin/guests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: guestId, follow_up_status: newStatus }),
    });

    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, follow_up_status: newStatus } : g));
    setActionLoading(null);
  }

  const filtered = guests.filter(g => {
    const matchesSearch = `${g.first_name} ${g.last_name} ${g.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || g.follow_up_status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: guests.length,
    pending: guests.filter(g => g.follow_up_status === 'pending').length,
    contacted: guests.filter(g => g.follow_up_status === 'contacted').length,
    converted: guests.filter(g => g.follow_up_status === 'converted').length,
  };

  if (loading) {
    return (
      <AdminLayout title="Guests">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

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
                  {guest.first_name[0]}{guest.last_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{guest.first_name} {guest.last_name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{guest.phone}</span>
                    {guest.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{guest.email}</span>}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                guest.follow_up_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                guest.follow_up_status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                guest.follow_up_status === 'converted' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>{guest.follow_up_status}</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Visited: {new Date(guest.visit_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <UserPlus className="w-4 h-4" />
                <span>Source: {guest.source}</span>
              </div>
              {guest.invited_by && (
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
              {guest.follow_up_status === 'pending' && (
                <>
                  <button
                    onClick={() => updateGuestStatus(guest.id, 'contacted')}
                    disabled={actionLoading === guest.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50"
                  >
                    <Phone className="w-4 h-4" />{actionLoading === guest.id ? 'Updating...' : 'Mark Contacted'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50">
                    <MessageSquare className="w-4 h-4" />Add Note
                  </button>
                </>
              )}
              {guest.follow_up_status === 'contacted' && (
                <>
                  <button
                    onClick={() => updateGuestStatus(guest.id, 'converted')}
                    disabled={actionLoading === guest.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />{actionLoading === guest.id ? 'Updating...' : 'Convert to Attendee'}
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
