import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Phone, Mail, Calendar, UserPlus, Check, Clock, X, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

type FollowUpStatus = 'pending' | 'contacted' | 'converted' | 'declined';

interface Guest {
  id: string; first_name: string; last_name: string; phone: string; email: string | null;
  visit_date: string; source: string; invited_by: string | null; follow_up_status: FollowUpStatus; notes: string | null;
}

export default function GuestsPage() {
  const [filter, setFilter] = useState<'all' | FollowUpStatus>('all');
  const [search, setSearch] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', source: 'walk-in' });
  const [noteDraftId, setNoteDraftId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('guests').select('id, first_name, last_name, phone, email, visit_date, source, invited_by, follow_up_status, notes').order('visit_date', { ascending: false });
    setGuests(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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

  async function updateStatus(id: string, status: FollowUpStatus) {
    setActionLoading(id);
    await supabase.from('guests').update({ follow_up_status: status }).eq('id', id);
    await load();
    setActionLoading(null);
  }

  async function saveNote(id: string) {
    await supabase.from('guests').update({ notes: noteText.trim() || null }).eq('id', id);
    setNoteDraftId(null);
    setNoteText('');
    load();
  }

  async function handleAddGuest() {
    if (!form.firstName || !form.lastName || !form.phone) return;
    setSaving(true);
    await supabase.from('guests').insert({
      first_name: form.firstName, last_name: form.lastName, phone: form.phone,
      email: form.email || null, source: form.source,
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ firstName: '', lastName: '', phone: '', email: '', source: 'walk-in' });
    load();
  }

  return (
    <AdminLayout title="Guests">
      <PageHeader
        title="Guest Management"
        subtitle={`${stats.pending} guests need follow-up`}
        actions={<button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg"><Plus className="w-4 h-4" />Add Guest</button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Total Guests</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border-l-4 border-l-amber-500 border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Pending Follow-up</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border-l-4 border-l-blue-500 border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Contacted</p>
          <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border-l-4 border-l-green-500 border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Converted</p>
          <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search guests..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-4">
        {filtered.map((guest) => (
          <div key={guest.id} className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
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
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Calendar className="w-4 h-4" /><span>Visited: {new Date(guest.visit_date).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><UserPlus className="w-4 h-4" /><span>Source: {guest.source}</span></div>
              {guest.invited_by && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span>Invited by member</span></div>
              )}
            </div>

            {guest.notes && (
              <div className="bg-white/[0.04] rounded-lg p-3 mb-4">
                <p className="text-sm text-white/50">{guest.notes}</p>
              </div>
            )}

            {noteDraftId === guest.id && (
              <div className="mb-4 space-y-2">
                <textarea rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." autoFocus />
                <div className="flex gap-2">
                  <button onClick={() => saveNote(guest.id)} className="px-3 py-1.5 text-xs font-medium bg-[#BF0A30] text-white rounded-lg">Save Note</button>
                  <button onClick={() => { setNoteDraftId(null); setNoteText(''); }} className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
              {guest.follow_up_status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus(guest.id, 'contacted')}
                    disabled={actionLoading === guest.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50"
                  >
                    <Phone className="w-4 h-4" />{actionLoading === guest.id ? 'Updating...' : 'Mark Contacted'}
                  </button>
                  <button onClick={() => { setNoteDraftId(guest.id); setNoteText(guest.notes ?? ''); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Add Note</button>
                </>
              )}
              {guest.follow_up_status === 'contacted' && (
                <>
                  <button
                    onClick={() => updateStatus(guest.id, 'converted')}
                    disabled={actionLoading === guest.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />{actionLoading === guest.id ? 'Updating...' : 'Convert to Attendee'}
                  </button>
                  <button onClick={() => { setNoteDraftId(guest.id); setNoteText(guest.notes ?? ''); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]"><Clock className="w-4 h-4" />Add Note</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No guests found</p>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Add Guest</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="First name" className="px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                <input placeholder="Last name" className="px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
              <input placeholder="+254..." className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <input placeholder="Email (optional)" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <select className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                <option value="walk-in">Walk-in</option>
                <option value="invite">Invite</option>
                <option value="online">Online</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">Cancel</button>
              <button onClick={handleAddGuest} disabled={saving || !form.firstName || !form.lastName || !form.phone} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">{saving ? 'Saving…' : 'Add Guest'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
