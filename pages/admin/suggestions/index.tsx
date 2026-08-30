import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, AlertCircle, ThumbsUp, Clock, CheckCircle, Eye, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

type Status = 'pending' | 'reviewing' | 'resolved';
type SuggestionType = 'suggestion' | 'complaint' | 'feedback';

interface Suggestion {
  id: string; is_anonymous: boolean; type: SuggestionType; category: string;
  subject: string; message: string; status: Status; admin_response: string | null; created_at: string;
}

export default function SuggestionsPage() {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | SuggestionType>('all');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDraftId, setNoteDraftId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('suggestions').select('id, is_anonymous, type, category, subject, message, status, admin_response, created_at').order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(s => {
    const matchesStatus = filter === 'all' || s.status === filter;
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: items.length,
    pending: items.filter(s => s.status === 'pending').length,
    reviewing: items.filter(s => s.status === 'reviewing').length,
    resolved: items.filter(s => s.status === 'resolved').length,
  };

  async function updateStatus(id: string, status: Status) {
    setBusyId(id);
    await supabase.from('suggestions').update({ status }).eq('id', id);
    setBusyId(null);
    load();
  }

  async function saveNote(id: string) {
    await supabase.from('suggestions').update({ admin_response: noteText.trim() || null }).eq('id', id);
    setNoteDraftId(null);
    setNoteText('');
    load();
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <ThumbsUp className="w-4 h-4 text-blue-500" />;
      case 'complaint': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'feedback': return <MessageSquare className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'feedback': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout title="Suggestions">
      <PageHeader title="Suggestions & Feedback" subtitle="View and respond to feedback from the congregation" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button onClick={() => setFilter('all')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border p-4 text-left transition-colors ${filter === 'all' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </button>
        <button onClick={() => setFilter('pending')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-amber-500 border p-4 text-left transition-colors ${filter === 'pending' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
        </button>
        <button onClick={() => setFilter('reviewing')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-blue-500 border p-4 text-left transition-colors ${filter === 'reviewing' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Reviewing</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewing}</p>
        </button>
        <button onClick={() => setFilter('resolved')} className={`bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-green-500 border p-4 text-left transition-colors ${filter === 'resolved' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-gray-200 dark:border-[#2D2D2D]'}`}>
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'suggestion', 'complaint', 'feedback'] as const).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
              typeFilter === type ? 'bg-[#BF0A30] text-white' : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600'
            }`}
          >
            {type === 'all' ? 'All Types' : type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTypeIcon(item.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{item.is_anonymous ? 'Anonymous' : 'Member'}</span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="capitalize">{item.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getTypeColor(item.type)}`}>{item.type}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  item.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>{item.status}</span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">{item.message}</p>

            {item.admin_response && (
              <div className="bg-gray-50 dark:bg-[#252525] rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Admin note</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.admin_response}</p>
              </div>
            )}

            {noteDraftId === item.id && (
              <div className="mb-4 space-y-2">
                <textarea rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Internal note or response..." autoFocus />
                <div className="flex gap-2">
                  <button onClick={() => saveNote(item.id)} className="px-3 py-1.5 text-xs font-medium bg-[#BF0A30] text-white rounded-lg">Save Note</button>
                  <button onClick={() => { setNoteDraftId(null); setNoteText(''); }} className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {item.status === 'pending' && <Clock className="w-4 h-4" />}
                {item.status === 'reviewing' && <Eye className="w-4 h-4" />}
                {item.status === 'resolved' && <CheckCircle className="w-4 h-4" />}
                <span className="capitalize">{item.status}</span>
              </div>
              <div className="flex gap-2">
                {item.status === 'pending' && (
                  <button onClick={() => updateStatus(item.id, 'reviewing')} disabled={busyId === item.id} className="px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">Start Review</button>
                )}
                {item.status === 'reviewing' && (
                  <button onClick={() => updateStatus(item.id, 'resolved')} disabled={busyId === item.id} className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Mark Resolved</button>
                )}
                <button onClick={() => { setNoteDraftId(item.id); setNoteText(item.admin_response ?? ''); }} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50">Add Note</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No suggestions found</p>
        </div>
      )}
    </AdminLayout>
  );
}
