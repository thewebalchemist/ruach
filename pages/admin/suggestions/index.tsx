import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MessageSquare, AlertCircle, ThumbsUp, Clock, CheckCircle, Eye } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Suggestion {
  id: string;
  user_id: string | null;
  is_anonymous: boolean;
  type: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export default function SuggestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
    if (!profile || !['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }

  async function loadData() {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSuggestions(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch('/api/admin/suggestions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    }
    setUpdating(null);
  }

  async function submitResponse(id: string) {
    if (!responseText.trim()) return;
    setUpdating(id);
    const res = await fetch('/api/admin/suggestions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, admin_response: responseText }),
    });
    if (res.ok) {
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, admin_response: responseText } : s));
      setRespondingTo(null);
      setResponseText('');
    }
    setUpdating(null);
  }

  const filtered = suggestions.filter(s => {
    const matchesStatus = filter === 'all' || s.status === filter;
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter(s => s.status === 'pending').length,
    reviewing: suggestions.filter(s => s.status === 'reviewing').length,
    resolved: suggestions.filter(s => s.status === 'resolved').length,
  };

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
      default: return 'bg-white/5 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Suggestions">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Suggestions">
      <PageHeader title="Suggestions & Feedback" subtitle="View and respond to feedback from the congregation" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button onClick={() => setFilter('all')} className={`bg-[#12151C] rounded-xl border p-4 text-left transition-colors ${filter === 'all' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-white/[0.06]'}`}>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </button>
        <button onClick={() => setFilter('pending')} className={`bg-[#12151C] rounded-xl border-l-4 border-l-amber-500 border p-4 text-left transition-colors ${filter === 'pending' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-white/[0.06]'}`}>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
        </button>
        <button onClick={() => setFilter('reviewing')} className={`bg-[#12151C] rounded-xl border-l-4 border-l-blue-500 border p-4 text-left transition-colors ${filter === 'reviewing' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-white/[0.06]'}`}>
          <p className="text-sm text-gray-500">Reviewing</p>
          <p className="text-2xl font-bold text-white">{stats.reviewing}</p>
        </button>
        <button onClick={() => setFilter('resolved')} className={`bg-[#12151C] rounded-xl border-l-4 border-l-green-500 border p-4 text-left transition-colors ${filter === 'resolved' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-white/[0.06]'}`}>
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-white">{stats.resolved}</p>
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'suggestion', 'complaint', 'feedback'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
              typeFilter === type
                ? 'bg-[#BF0A30] text-white'
                : 'bg-[#12151C] border border-white/[0.06] text-gray-600'
            }`}
          >
            {type === 'all' ? 'All Types' : type}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTypeIcon(item.type)}
                <div>
                  <h3 className="font-semibold text-white">{item.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{item.is_anonymous ? 'Anonymous' : 'Member'}</span>
                    <span>-</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span>-</span>
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

            <p className="text-white/70 mb-4">{item.message}</p>

            {item.admin_response && (
              <div className="bg-white/[0.04] rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Admin Response</p>
                <p className="text-sm text-white/70">{item.admin_response}</p>
              </div>
            )}

            {respondingTo === item.id && (
              <div className="mb-4">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg resize-none mb-2"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setRespondingTo(null); setResponseText(''); }} className="px-3 py-1.5 text-sm text-white/50 border border-white/10 rounded-lg">Cancel</button>
                  <button onClick={() => submitResponse(item.id)} disabled={updating === item.id} className="px-3 py-1.5 text-sm bg-[#BF0A30] text-white rounded-lg disabled:opacity-50">
                    {updating === item.id ? 'Saving...' : 'Submit Response'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {item.status === 'pending' && <Clock className="w-4 h-4" />}
                {item.status === 'reviewing' && <Eye className="w-4 h-4" />}
                {item.status === 'resolved' && <CheckCircle className="w-4 h-4" />}
                <span className="capitalize">{item.status}</span>
              </div>
              <div className="flex gap-2">
                {item.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(item.id, 'reviewing')}
                    disabled={updating === item.id}
                    className="px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50"
                  >
                    {updating === item.id ? 'Updating...' : 'Start Review'}
                  </button>
                )}
                {item.status === 'reviewing' && (
                  <button
                    onClick={() => updateStatus(item.id, 'resolved')}
                    disabled={updating === item.id}
                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating === item.id ? 'Updating...' : 'Mark Resolved'}
                  </button>
                )}
                <button
                  onClick={() => { setRespondingTo(item.id); setResponseText(item.admin_response || ''); }}
                  className="px-4 py-2 text-sm font-medium border border-white/10 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No suggestions found</p>
        </div>
      )}
    </AdminLayout>
  );
}
