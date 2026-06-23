import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface CrosspointOption {
  id: string;
  name: string;
  status: string;
  member_count: number;
  max_members: number;
}

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [crosspoints, setCrosspoints] = useState<CrosspointOption[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    address: '',
    occupation: '',
    marital_status: '',
    crosspoint_id: '',
    role: 'member',
  });

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
    if (!profile || !['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadDropdowns();
  }

  async function loadDropdowns() {
    const { data } = await supabase
      .from('crosspoints')
      .select('id, name, status, member_count, max_members')
      .eq('status', 'active')
      .order('name');
    if (data) setCrosspoints(data);
    setPageLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
        occupation: formData.occupation || null,
        marital_status: formData.marital_status || null,
        role: formData.role,
        status: 'active',
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.push('/admin/members');
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create member');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (pageLoading) {
    return (
      <AdminLayout title="Add Member">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Add Member">
      <div className="max-w-3xl">
        <Link href="/admin/members" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Members
        </Link>

        <PageHeader title="Add New Member" subtitle="Create a new member record" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+254..." className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Neighborhood, City" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marital Status</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]">
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Church Assignment */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Church Assignment</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]">
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crosspoint</label>
                <select name="crosspoint_id" value={formData.crosspoint_id} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]">
                  <option value="">Not assigned</option>
                  {crosspoints.map(cp => (
                    <option key={cp.id} value={cp.id}>{cp.name} ({cp.member_count}/{cp.max_members})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/members" className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
