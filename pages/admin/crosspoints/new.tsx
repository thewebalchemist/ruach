import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface ProfileOption {
  id: string;
  first_name: string;
  last_name: string;
}

export default function NewCrosspointPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaders, setLeaders] = useState<ProfileOption[]>([]);
  const [allMembers, setAllMembers] = useState<ProfileOption[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
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
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setPageLoading(true);

    // Fetch leaders (admin, pastor, leader roles)
    const { data: leaderData } = await db
      .from('profiles')
      .select('id, first_name, last_name')
      .in('role', ['leader', 'admin', 'pastor']);

    setLeaders((leaderData ?? []) as ProfileOption[]);

    // Fetch all profiles for assistant/treasurer dropdowns
    const { data: memberData } = await db
      .from('profiles')
      .select('id, first_name, last_name')
      .order('first_name');

    setAllMembers((memberData ?? []) as ProfileOption[]);

    setPageLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/crosspoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location || null,
          area: formData.area,
          leader_id: formData.leader_id || null,
          assistant_id: formData.assistant_id || null,
          treasurer_id: formData.treasurer_id || null,
          meeting_day: formData.meeting_day,
          meeting_time: formData.meeting_time,
          venue: formData.venue || null,
          max_members: parseInt(formData.max_members, 10) || 15,
          status: 'active',
        }),
      });

      if (res.ok) {
        router.push('/admin/crosspoints');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create crosspoint');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (pageLoading) {
    return (
      <AdminLayout title="Create Crosspoint">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Create Crosspoint">
      <div className="max-w-3xl">
        <Link href="/admin/crosspoints" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoints
        </Link>

        <PageHeader title="Create Crosspoint" subtitle="Set up a new home church" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Crosspoint Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1">Crosspoint Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Kilimani Crosspoint" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Area *</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} required placeholder="e.g., Kilimani" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Kilimani, Nairobi" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Max Members</label>
                <input type="number" name="max_members" value={formData.max_members} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Leadership</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Leader *</label>
                <select name="leader_id" value={formData.leader_id} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select leader...</option>
                  {leaders.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Assistant Leader</label>
                <select name="assistant_id" value={formData.assistant_id} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select assistant...</option>
                  {allMembers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Treasurer</label>
                <select name="treasurer_id" value={formData.treasurer_id} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select treasurer...</option>
                  {allMembers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
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
                <select name="meeting_day" value={formData.meeting_day} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select day...</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Meeting Time *</label>
                <input type="text" name="meeting_time" value={formData.meeting_time} onChange={handleChange} required placeholder="e.g., 7:00 PM" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Venue</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g., Host's residence" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/crosspoints" className="px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />{submitting ? 'Creating...' : 'Create Crosspoint'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
