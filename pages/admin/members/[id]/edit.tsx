import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = router.query;
  const { hasPermission } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', gender: '', date_of_birth: '',
    address: '', occupation: '', marital_status: '', crosspoint_zone: '',
    role: 'member', status: 'active', member_id: '',
  });

  const loadData = useCallback(async () => {
    if (typeof id !== 'string') return;
    setPageLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) {
      setMemberName(`${data.first_name} ${data.last_name}`);
      setMemberEmail(data.email ?? '');
      setFormData({
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        phone: data.phone ?? '',
        gender: data.gender ?? '',
        date_of_birth: data.date_of_birth ?? '',
        address: data.address ?? '',
        occupation: data.occupation ?? '',
        marital_status: data.marital_status ?? '',
        crosspoint_zone: data.crosspoint_zone ?? '',
        role: data.role ?? 'member',
        status: data.status ?? 'active',
        member_id: data.member_id ?? '',
      });
    } else {
      setMemberName('');
    }
    setPageLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/admin/update-member?id=${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        memberId: formData.member_id || null,
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        gender: formData.gender || null,
        dateOfBirth: formData.date_of_birth || null,
        address: formData.address || null,
        occupation: formData.occupation || null,
        maritalStatus: formData.marital_status || null,
        role: formData.role,
        status: formData.status,
        crosspointZone: formData.crosspoint_zone || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? 'Failed to save'); return; }
    router.push(`/admin/members/${id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const canEditRole = hasPermission('users', 'manage');

  return (
    <AdminLayout title={`Edit ${memberName}`} requirePermission={{ moduleKey: 'members', action: 'edit' }}>
      <div className="max-w-3xl">
        <Link href={`/admin/members/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Member
        </Link>

        <PageHeader title={`Edit ${memberName}`} subtitle={formData.member_id ? `Member ID: ${formData.member_id}` : 'Not yet a member'} />

        {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">First Name *</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Last Name *</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={memberEmail} disabled className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]" />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Additional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Marital Status</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C]">
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Membership */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Membership</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Number</label>
                <input type="text" name="member_id" value={formData.member_id} onChange={handleChange}
                  placeholder="e.g. RM-01042" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] font-mono" />
                <p className="text-xs text-gray-500 mt-1">Auto-assigned on graduation — editable here for corrections.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crosspoint Zone</label>
                <select name="crosspoint_zone" value={formData.crosspoint_zone} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]">
                  <option value="">Not assigned</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="north">North</option>
                  <option value="west">West</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} disabled={!canEditRole}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] disabled:opacity-50">
                  <option value="student">Student</option>
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="pastor">Pastor</option>
                </select>
                {!canEditRole && <p className="text-xs text-gray-500 mt-1">Requires the users.manage permission.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end">
            <div className="flex gap-3">
              <Link href={`/admin/members/${id}`} className="px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-gray-50">Cancel</Link>
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
