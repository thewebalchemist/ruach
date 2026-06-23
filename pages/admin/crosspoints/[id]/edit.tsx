import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface ProfileOption {
  id: string;
  first_name: string;
  last_name: string;
}

export default function EditCrosspointPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile, loading: authLoading, session } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crosspoint, setCrosspoint] = useState<any>(null);
  const [leaders, setLeaders] = useState<ProfileOption[]>([]);
  const [allProfiles, setAllProfiles] = useState<ProfileOption[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    status: 'active',
    leader_id: '',
    assistant_id: '',
    treasurer_id: '',
    meeting_day: '',
    meeting_time: '',
    venue: '',
    max_members: '15',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor'].includes(profile.role)) { router.push('/'); return; }
    if (id) loadData();
  }, [authLoading, profile, id]);

  async function loadData() {
    setPageLoading(true);

    const [{ data: cpData }, { data: leaderData }, { data: profileData }] = await Promise.all([
      db.from('crosspoints').select('*').eq('id', id).single(),
      db.from('profiles').select('id, first_name, last_name').in('role', ['leader', 'admin', 'pastor']),
      db.from('profiles').select('id, first_name, last_name').not('member_id', 'is', null),
    ]);

    if (cpData) {
      setCrosspoint(cpData);
      setFormData({
        name: cpData.name || '',
        location: cpData.location || '',
        area: cpData.area || '',
        status: cpData.status || 'active',
        leader_id: cpData.leader_id || '',
        assistant_id: cpData.assistant_id || '',
        treasurer_id: cpData.treasurer_id || '',
        meeting_day: cpData.meeting_day || '',
        meeting_time: cpData.meeting_time || '',
        venue: cpData.venue || '',
        max_members: String(cpData.max_members || 15),
      });
    }

    setLeaders((leaderData ?? []) as ProfileOption[]);
    setAllProfiles((profileData ?? []) as ProfileOption[]);
    setPageLoading(false);
  }

  if (pageLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!crosspoint) {
    return (
      <AdminLayout title="Crosspoint Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Crosspoint not found</p>
          <Link href="/admin/crosspoints" className="text-[#BF0A30] hover:underline mt-4 inline-block">Back to Crosspoints</Link>
        </div>
      </AdminLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id,
      name: formData.name,
      location: formData.location,
      area: formData.area,
      status: formData.status,
      leader_id: formData.leader_id || null,
      assistant_id: formData.assistant_id || null,
      treasurer_id: formData.treasurer_id || null,
      meeting_day: formData.meeting_day,
      meeting_time: formData.meeting_time,
      venue: formData.venue,
      max_members: parseInt(formData.max_members, 10) || 15,
    };

    const res = await fetch('/api/admin/crosspoints', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      router.push(`/admin/crosspoints/${id}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <AdminLayout title={`Edit ${crosspoint.name}`}>
      <div className="max-w-3xl">
        <Link href={`/admin/crosspoints/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoint
        </Link>

        <PageHeader title={`Edit ${crosspoint.name}`} subtitle={`${crosspoint.member_count ?? 0} members`} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Crosspoint Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1">Crosspoint Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Area *</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]">
                  <option value="active">Active</option>
                  <option value="forming">Forming</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Max Members</label>
                <input type="number" name="max_members" value={formData.max_members} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Leadership</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Leader *</label>
                <select name="leader_id" value={formData.leader_id} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]">
                  <option value="">Select leader...</option>
                  {leaders.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Assistant</label>
                <select name="assistant_id" value={formData.assistant_id} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]">
                  <option value="">None</option>
                  {allProfiles.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Treasurer</label>
                <select name="treasurer_id" value={formData.treasurer_id} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]">
                  <option value="">None</option>
                  {allProfiles.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Meeting Schedule */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Meeting Schedule</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Meeting Day *</label>
                <select name="meeting_day" value={formData.meeting_day} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Meeting Time *</label>
                <input type="text" name="meeting_time" value={formData.meeting_time} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Venue</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />Delete Crosspoint
            </button>
            <div className="flex gap-3">
              <Link href={`/admin/crosspoints/${id}`} className="px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-white/[0.06]">Cancel</Link>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
