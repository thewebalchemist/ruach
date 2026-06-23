import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Bell, Eye, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Notice {
  id: string;
  title: string;
  content: string;
  scope: string;
  priority: string;
  published_at: string;
  expires_at: string | null;
  author_id: string;
  author_first_name?: string;
  author_last_name?: string;
}

export default function NoticesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

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
      .from('notices')
      .select('*, profiles!notices_author_id_fkey(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotices(data.map((n: any) => ({
        ...n,
        author_first_name: n.profiles?.first_name,
        author_last_name: n.profiles?.last_name,
      })));
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    setDeleting(id);
    const res = await fetch('/api/admin/notices?id=' + id, { method: 'DELETE' });
    if (res.ok) {
      setNotices(prev => prev.filter(n => n.id !== id));
    }
    setDeleting(null);
  }

  const filtered = notices.filter(n => filter === 'all' || n.scope === filter);

  if (loading) {
    return (
      <AdminLayout title="Notices">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Notices">
      <PageHeader
        title="Notices & Announcements"
        subtitle="Manage church-wide and targeted announcements"
        actions={<Link href="/admin/notices/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg"><Plus className="w-4 h-4" />Create Notice</Link>}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'all', label: 'Church-wide' },
          { id: 'members', label: 'Members Only' },
          { id: 'leaders', label: 'Leaders Only' },
          { id: 'department', label: 'Department' },
          { id: 'crosspoint', label: 'Crosspoint' },
        ].map((tab, i) => (
          <button
            key={i}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#BF0A30] text-white'
                : 'bg-[#12151C] border border-white/[0.06] text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.map((notice) => (
          <div key={notice.id} className={`bg-[#12151C] rounded-xl border ${notice.priority === 'high' ? 'border-l-4 border-l-red-500' : notice.priority === 'medium' ? 'border-l-4 border-l-amber-500' : ''} border-white/[0.06] p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{notice.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    notice.priority === 'high' ? 'bg-red-100 text-red-800' :
                    notice.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-white/5 text-gray-700'
                  }`}>{notice.priority}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(notice.published_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{notice.scope}</span>
                  {notice.expires_at && <span>Expires: {new Date(notice.expires_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  disabled={deleting === notice.id}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-white/70 mb-4">{notice.content}</p>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>By {notice.author_first_name} {notice.author_last_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notices found</p>
        </div>
      )}
    </AdminLayout>
  );
}
