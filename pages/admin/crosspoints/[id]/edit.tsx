import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface ProfileOption { id: string; first_name: string; last_name: string }

export default function EditCrosspointPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [loading, setLoading] = useState(false);
  const [cpLoading, setCpLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaders, setLeaders] = useState<ProfileOption[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '', location: '', area: '', zone: '', status: 'active',
    leaderId: '', meetingDay: '', meetingTime: '', venue: '', maxMembers: '15',
  });

  const load = useCallback(async () => {
    if (!id) return;
    setCpLoading(true);
    const [cpRes, leadersRes] = await Promise.all([
      supabase.from('crosspoints').select('*').eq('id', id).single(),
      supabase.from('profiles').select('id, first_name, last_name').in('role', ['leader', 'admin', 'pastor']).order('first_name'),
    ]);
    setLeaders(leadersRes.data ?? []);
    if (cpRes.data) {
      const cp = cpRes.data;
      setFormData({
        name: cp.name, location: cp.location, area: cp.area, zone: cp.zone, status: cp.status,
        leaderId: cp.leader_id ?? '', meetingDay: cp.meeting_day ?? '', meetingTime: cp.meeting_time ?? '',
        venue: cp.venue ?? '', maxMembers: String(cp.max_members),
      });
      setMemberCount(cp.member_count);
    }
    setCpLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError('');
    const { error: updateError } = await supabase.from('crosspoints').update({
      name: formData.name, location: formData.location, area: formData.area, zone: formData.zone,
      status: formData.status, leader_id: formData.leaderId || null, meeting_day: formData.meetingDay,
      meeting_time: formData.meetingTime || null, venue: formData.venue || null,
      max_members: parseInt(formData.maxMembers, 10) || 15,
    }).eq('id', id);
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    router.push(`/admin/crosspoints/${id}`);
  };

  async function handleDelete() {
    if (!id || !confirm(`Delete this crosspoint permanently? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from('crosspoints').delete().eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    router.push('/admin/crosspoints');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const zones = ['north', 'south', 'east', 'west'];

  if (cpLoading) {
    return <AdminLayout title="Edit Crosspoint"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title={`Edit ${formData.name}`}>
      <div className="max-w-3xl">
        <Link href={`/admin/crosspoints/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoint
        </Link>

        <PageHeader title={`Edit ${formData.name}`} subtitle={`${memberCount} members`} />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-300">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Crosspoint Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crosspoint Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area *</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone *</label>
                <select name="zone" value={formData.zone} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  {zones.map(z => <option key={z} value={z}>{z.charAt(0).toUpperCase() + z.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="active">Active</option>
                  <option value="forming">Forming</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Members</label>
                <input type="number" name="maxMembers" value={formData.maxMembers} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Leadership</h2>
            <div className="grid sm:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leader</label>
                <select name="leaderId" value={formData.leaderId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">None</option>
                  {leaders.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">Assistant/treasurer are managed from the crosspoint's Members page.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Meeting Schedule</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Day *</label>
                <select name="meetingDay" value={formData.meetingDay} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Time *</label>
                <input type="text" name="meetingTime" value={formData.meetingTime} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />Delete Crosspoint
            </button>
            <div className="flex gap-3">
              <Link href={`/admin/crosspoints/${id}`} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
                <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
