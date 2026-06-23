import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Check, X, Clock, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface JoinRequestRow {
  id: string;
  user_id: string;
  department_id: string;
  sub_team_id: string | null;
  message: string | null;
  request_date: string;
  status: string;
  profiles: { first_name: string; last_name: string } | null;
  departments: { name: string; icon?: string } | null;
}

export default function DepartmentRequestsPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<JoinRequestRow[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setLoading(true);

    const { data } = await db
      .from('department_join_requests')
      .select('*, profiles(first_name, last_name), departments(name, icon)')
      .order('request_date', { ascending: false });

    setRequests((data ?? []) as JoinRequestRow[]);
    setLoading(false);
  }

  async function handleAction(id: string, status: 'approved' | 'declined') {
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/department-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Action failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setProcessing(null);
    }
  }

  const pending = requests.filter(r => r.status === 'pending');
  const processed = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <AdminLayout title="Join Requests">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Join Requests">
      <div className="mb-6">
        <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Departments
        </Link>
        <PageHeader title="Department Join Requests" subtitle={`${pending.length} pending requests`} />
      </div>

      {pending.length > 0 ? (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Requests</h2>
          {pending.map((req) => {
            const userName = req.profiles
              ? `${req.profiles.first_name} ${req.profiles.last_name}`
              : 'Unknown';
            const initials = req.profiles
              ? `${req.profiles.first_name[0]}${req.profiles.last_name[0]}`
              : '??';
            const deptName = req.departments?.name ?? 'Unknown';
            const deptIcon = req.departments?.icon ?? '';

            return (
              <div key={req.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                      <p className="text-sm text-gray-500">{req.user_id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(req.request_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#252525] rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Requesting to join:</p>
                  <div className="flex items-center gap-2">
                    {deptIcon && <span className="text-2xl">{deptIcon}</span>}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{deptName}</p>
                      {req.sub_team_id && <p className="text-sm text-gray-500">Sub-team: {req.sub_team_id}</p>}
                    </div>
                  </div>
                </div>

                {req.message && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Message:</p>
                    <p className="text-gray-700 dark:text-gray-300">{req.message}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    disabled={processing === req.id}
                    onClick={() => handleAction(req.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />Approve
                  </button>
                  <button
                    disabled={processing === req.id}
                    onClick={() => handleAction(req.id, 'declined')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center mb-8">
          <p className="text-gray-500">No pending requests</p>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recently Processed</h2>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-[#252525]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {processed.map((req) => {
                  const userName = req.profiles
                    ? `${req.profiles.first_name} ${req.profiles.last_name}`
                    : 'Unknown';
                  const deptName = req.departments?.name ?? 'Unknown';

                  return (
                    <tr key={req.id}>
                      <td className="py-3 px-4 font-medium">{userName}</td>
                      <td className="py-3 px-4">{deptName}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(req.request_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
