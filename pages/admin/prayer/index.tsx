import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MessageSquare, CheckCircle, Clock, User, AlertCircle, Heart } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface PrayerRequest {
  id: string;
  user_id: string | null;
  user_name: string | null;
  is_anonymous: boolean;
  category: string;
  request: string;
  is_urgent: boolean;
  status: string;
  created_at: string;
}

export default function PrayerRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

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
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch('/api/admin/prayer-requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setRequests(prev => prev.map(pr => pr.id === id ? { ...pr, status } : pr));
    }
    setUpdating(null);
  }

  const filtered = requests.filter(pr => filter === 'all' || pr.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(p => p.status === 'pending').length,
    praying: requests.filter(p => p.status === 'praying').length,
    answered: requests.filter(p => p.status === 'answered').length,
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      healing: 'bg-red-100 text-red-800',
      provision: 'bg-amber-100 text-amber-800',
      guidance: 'bg-blue-100 text-blue-800',
      family: 'bg-green-100 text-green-800',
      thanksgiving: 'bg-purple-100 text-purple-800',
      other: 'bg-white/5 text-gray-800',
    };
    return colors[cat] || colors.other;
  };

  if (loading) {
    return (
      <AdminLayout title="Prayer Requests">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Prayer Requests">
      <PageHeader title="Prayer Requests" subtitle="Manage and respond to prayer requests from the congregation" />

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
        <button onClick={() => setFilter('praying')} className={`bg-[#12151C] rounded-xl border-l-4 border-l-blue-500 border p-4 text-left transition-colors ${filter === 'praying' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-white/[0.06]'}`}>
          <p className="text-sm text-gray-500">Being Prayed For</p>
          <p className="text-2xl font-bold text-white">{stats.praying}</p>
        </button>
        <button onClick={() => setFilter('answered')} className={`bg-[#12151C] rounded-xl border-l-4 border-l-green-500 border p-4 text-left transition-colors ${filter === 'answered' ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/20' : 'border-white/[0.06]'}`}>
          <p className="text-sm text-gray-500">Answered</p>
          <p className="text-2xl font-bold text-white">{stats.answered}</p>
        </button>
      </div>

      {/* Prayer Requests List */}
      <div className="space-y-4">
        {filtered.map((pr) => (
          <div key={pr.id} className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {pr.is_anonymous ? (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                    {pr.user_name?.[0] || 'A'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">
                    {pr.is_anonymous ? 'Anonymous' : pr.user_name}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(pr.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pr.is_urgent && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3" />Urgent
                  </span>
                )}
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getCategoryColor(pr.category)}`}>{pr.category}</span>
              </div>
            </div>

            <p className="text-white/70 mb-4">{pr.request}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
              <div className="flex items-center gap-2">
                {pr.status === 'pending' && <Clock className="w-4 h-4 text-amber-500" />}
                {pr.status === 'praying' && <Heart className="w-4 h-4 text-blue-500" />}
                {pr.status === 'answered' && <CheckCircle className="w-4 h-4 text-green-500" />}
                <span className="text-sm text-gray-500 capitalize">{pr.status}</span>
              </div>
              <div className="flex gap-2">
                {pr.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(pr.id, 'praying')}
                    disabled={updating === pr.id}
                    className="px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50"
                  >
                    {updating === pr.id ? 'Updating...' : 'Mark as Praying'}
                  </button>
                )}
                {pr.status === 'praying' && (
                  <button
                    onClick={() => updateStatus(pr.id, 'answered')}
                    disabled={updating === pr.id}
                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating === pr.id ? 'Updating...' : 'Mark Answered'}
                  </button>
                )}
                <button className="px-4 py-2 text-sm font-medium border border-white/10 dark:border-[#2D2D2D] rounded-lg hover:bg-white/[0.06]">Assign to Intercessors</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No prayer requests in this category</p>
        </div>
      )}
    </AdminLayout>
  );
}
