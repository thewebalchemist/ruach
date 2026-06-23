import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface CrosspointOption {
  id: string;
  name: string;
  status: string;
  member_count: number;
  max_members: number;
}

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile: authProfile, loading: authLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberId, setMemberId] = useState('');
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
    role: 'member',
    status: 'active',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!authProfile) { router.push('/auth/login?redirectTo=/admin'); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(authProfile.role)) {
      router.push('/');
      return;
    }
    if (id) loadData();
  }, [authLoading, authProfile, id]);

  async function loadData() {
    setPageLoading(true);

    const [{ data: profileData }, { data: cpData }] = await Promise.all([
      db.from('profiles').select('*').eq('id', id).single(),
      db.from('crosspoints').select('id, name, status, member_count, max_members')
        .in('status', ['active', 'forming'])
        .order('name'),
    ]);

    if (profileData) {
      setMemberName(`${profileData.first_name} ${profileData.last_name}`);
      setMemberId(profileData.member_id ?? '');
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        gender: profileData.gender || '',
        date_of_birth: profileData.date_of_birth || '',
        address: profileData.address || '',
        occupation: profileData.occupation || '',
        marital_status: profileData.marital_status || '',
        role: profileData.role || 'member',
        status: profileData.status || 'active',
      });
    }

    setCrosspoints((cpData ?? []) as CrosspointOption[]);
    setPageLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch('/api/admin/members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...formData }),
    });

    const result = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(result.error || 'Failed to save');
      return;
    }

    router.push(`/admin/members/${id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (pageLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!memberName) {
    return (
      <AdminLayout title="Member Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Member not found</p>
          <Link href="/admin/members" className="text-[#BF0A30] hover:underline mt-4 inline-block">Back to Members</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit ${memberName}`}>
      <div className="max-w-3xl">
        <Link href={`/admin/members/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Member
        </Link>

        <PageHeader title={`Edit ${memberName}`} subtitle={memberId ? `Member ID: ${memberId}` : undefined} />

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marital Status</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]">
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
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]">
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                  <option value="admin">Admin</option>
                  <option value="pastor">Pastor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button type="button" className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700">Delete Member</button>
            <div className="flex gap-3">
              <Link href={`/admin/members/${id}`} className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
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
