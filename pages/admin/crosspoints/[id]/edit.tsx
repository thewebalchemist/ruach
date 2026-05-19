import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { mockCrosspoints, mockMembers } from '@/data';

export default function EditCrosspointPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  
  const crosspoint = mockCrosspoints.find(cp => cp.id === id);
  const leaders = mockMembers.filter(m => ['leader', 'admin', 'pastor'].includes(m.role));
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    status: 'active',
    leaderId: '',
    assistantId: '',
    treasurerId: '',
    meetingDay: '',
    meetingTime: '',
    venue: '',
    maxMembers: '15',
  });

  useEffect(() => {
    if (crosspoint) {
      setFormData({
        name: crosspoint.name,
        location: crosspoint.location,
        area: crosspoint.area,
        status: crosspoint.status,
        leaderId: crosspoint.leaderId,
        assistantId: crosspoint.assistantId || '',
        treasurerId: crosspoint.treasurerId || '',
        meetingDay: crosspoint.meetingDay,
        meetingTime: crosspoint.meetingTime,
        venue: crosspoint.venue,
        maxMembers: String(crosspoint.maxMembers),
      });
    }
  }, [crosspoint]);

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
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    router.push(`/admin/crosspoints/${id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <AdminLayout title={`Edit ${crosspoint.name}`}>
      <div className="max-w-3xl">
        <Link href={`/admin/crosspoints/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoint
        </Link>
        
        <PageHeader title={`Edit ${crosspoint.name}`} subtitle={`${crosspoint.memberCount} members`} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
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

          {/* Leadership */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Leadership</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leader *</label>
                <select name="leaderId" value={formData.leaderId} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">Select leader...</option>
                  {leaders.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assistant</label>
                <select name="assistantId" value={formData.assistantId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">None</option>
                  {mockMembers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treasurer</label>
                <select name="treasurerId" value={formData.treasurerId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                  <option value="">None</option>
                  {mockMembers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Meeting Schedule */}
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

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700">
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
