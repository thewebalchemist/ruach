import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface ProfileOption { id: string; first_name: string; last_name: string }

export default function NewCrosspointPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leaders, setLeaders] = useState<ProfileOption[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    zone: '',
    leaderId: '',
    assistantId: '',
    treasurerId: '',
    meetingDay: '',
    meetingTime: '',
    venue: '',
    maxMembers: '15',
  });

  useEffect(() => {
    supabase.from('profiles').select('id, first_name, last_name').in('role', ['leader', 'admin', 'pastor']).order('first_name')
      .then(({ data }) => setLeaders(data ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: insertError } = await supabase.from('crosspoints').insert({
      name: formData.name,
      location: formData.location || formData.area,
      area: formData.area,
      zone: formData.zone,
      leader_id: formData.leaderId,
      assistant_id: formData.assistantId || null,
      treasurer_id: formData.treasurerId || null,
      meeting_day: formData.meetingDay,
      meeting_time: formData.meetingTime || null,
      venue: formData.venue || null,
      max_members: parseInt(formData.maxMembers, 10) || 15,
    }).select('id').single();
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push(`/admin/crosspoints/${data.id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const zones = ['north', 'south', 'east', 'west'];

  return (
    <AdminLayout title="Create Crosspoint">
      <div className="max-w-3xl">
        <Link href="/admin/crosspoints" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoints
        </Link>

        <PageHeader title="Create Crosspoint" subtitle="Set up a new home church" />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-300">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Crosspoint Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crosspoint Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Kilimani Crosspoint" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area *</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} required placeholder="e.g., Kilimani" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone *</label>
                <select name="zone" value={formData.zone} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select zone...</option>
                  {zones.map(z => <option key={z} value={z}>{z.charAt(0).toUpperCase() + z.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g., Kilimani, Nairobi" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leader *</label>
                <select name="leaderId" value={formData.leaderId} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select leader...</option>
                  {leaders.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">Only profiles with role leader/admin/pastor appear here. Assistant/treasurer can be assigned later from the crosspoint's Members page.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Meeting Schedule</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Day *</label>
                <select name="meetingDay" value={formData.meetingDay} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select day...</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Time *</label>
                <input type="text" name="meetingTime" value={formData.meetingTime} onChange={handleChange} required placeholder="e.g., 7:00 PM" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g., Host's residence" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/crosspoints" className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />{loading ? 'Creating...' : 'Create Crosspoint'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
