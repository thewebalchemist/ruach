import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X, Clock, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { DepartmentIcon } from '@/components/shared/DepartmentIcon';
import { supabase } from '@/lib/supabase';

interface JoinRequest {
  id: string; user_id: string; department_id: string; sub_team_id: string | null;
  message: string | null; status: string; request_date: string;
  profiles: { first_name: string; last_name: string; phone: string | null; member_id: string | null } | null;
  departments: { name: string; icon: string | null } | null;
}

export default function DepartmentRequestsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('department_join_requests')
      .select('id, user_id, department_id, sub_team_id, message, status, request_date, profiles(first_name, last_name, phone, member_id), departments(name, icon)')
      .order('request_date', { ascending: false });
    setRequests((data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = requests.filter(r => r.status === 'pending');
  const processed = requests.filter(r => r.status !== 'pending');

  async function decide(req: JoinRequest, approve: boolean) {
    setProcessing(req.id);
    const { data: { session } } = await supabase.auth.getSession();

    await supabase.from('department_join_requests').update({
      status: approve ? 'approved' : 'declined',
      reviewed_by: session?.user.id ?? null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', req.id);

    if (approve) {
      await supabase.from('department_memberships').upsert({
        user_id: req.user_id, department_id: req.department_id, sub_team_id: req.sub_team_id,
        role: 'member', status: 'active',
      }, { onConflict: 'user_id,department_id' });
    }

    setProcessing(null);
    load();
  }

  return (
    <AdminLayout title="Join Requests">
      <div className="mb-6">
        <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Departments
        </Link>
        <PageHeader title="Department Join Requests" subtitle={`${pending.length} pending requests`} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <>
      {pending.length > 0 ? (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Requests</h2>
          {pending.map((req) => (
            <div key={req.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                    {req.profiles?.first_name?.[0]}{req.profiles?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{req.profiles?.first_name} {req.profiles?.last_name}</p>
                    <p className="text-sm text-gray-500">{req.profiles?.member_id ?? 'No member ID'} • {req.profiles?.phone}</p>
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
                  <DepartmentIcon name={req.departments?.icon} className="w-6 h-6 text-[#BF0A30]" />
                  <p className="font-medium text-gray-900 dark:text-white">{req.departments?.name}</p>
                </div>
              </div>

              {req.message && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Message:</p>
                  <p className="text-gray-700 dark:text-gray-300">{req.message}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => decide(req, true)} disabled={processing === req.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
                  <Check className="w-4 h-4" />{processing === req.id ? 'Processing…' : 'Approve'}
                </button>
                <button onClick={() => decide(req, false)} disabled={processing === req.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50">
                  <X className="w-4 h-4" />Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center mb-8">
          <div className="text-4xl mb-4">✨</div>
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
                {processed.map((req) => (
                  <tr key={req.id}>
                    <td className="py-3 px-4 font-medium">{req.profiles?.first_name} {req.profiles?.last_name}</td>
                    <td className="py-3 px-4">{req.departments?.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(req.request_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}
    </AdminLayout>
  );
}
