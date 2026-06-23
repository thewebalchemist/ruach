import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, X, Clock, Home, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface TransferRow {
  id: string;
  user_id: string;
  from_crosspoint_id: string;
  to_crosspoint_id: string;
  reason: string;
  request_date: string;
  status: string;
}

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  member_id: string | null;
  phone: string | null;
}

interface CrosspointRow {
  id: string;
  name: string;
  area: string;
}

export default function TransfersPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [crosspoints, setCrosspoints] = useState<Record<string, CrosspointRow>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setLoading(true);

    const { data: transferData } = await db
      .from('transfer_requests')
      .select('*')
      .order('request_date', { ascending: false });

    const rows = (transferData ?? []) as TransferRow[];
    setTransfers(rows);

    // Fetch unique user profiles
    const userIds = [...new Set(rows.map(r => r.user_id))];
    if (userIds.length > 0) {
      const { data: profileData } = await db
        .from('profiles')
        .select('id, first_name, last_name, member_id, phone')
        .in('id', userIds);

      const profileMap: Record<string, ProfileRow> = {};
      for (const p of (profileData ?? []) as ProfileRow[]) {
        profileMap[p.id] = p;
      }
      setProfiles(profileMap);
    }

    // Fetch unique crosspoints
    const cpIds = [...new Set(rows.flatMap(r => [r.from_crosspoint_id, r.to_crosspoint_id]))];
    if (cpIds.length > 0) {
      const { data: cpData } = await db
        .from('crosspoints')
        .select('id, name, area')
        .in('id', cpIds);

      const cpMap: Record<string, CrosspointRow> = {};
      for (const cp of (cpData ?? []) as CrosspointRow[]) {
        cpMap[cp.id] = cp;
      }
      setCrosspoints(cpMap);
    }

    setLoading(false);
  }

  async function handleAction(id: string, status: 'approved' | 'declined') {
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/crosspoint-transfers', {
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

  const pending = transfers.filter(t => t.status === 'pending');
  const processed = transfers.filter(t => t.status !== 'pending');

  if (loading) {
    return (
      <AdminLayout title="Transfer Requests">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Transfer Requests">
      <div className="mb-6">
        <Link href="/admin/crosspoints" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoints
        </Link>
        <PageHeader title="Crosspoint Transfers" subtitle={`${pending.length} pending transfer requests`} />
      </div>

      {pending.length > 0 ? (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-white">Pending Requests</h2>
          {pending.map((req) => {
            const user = profiles[req.user_id];
            const fromCP = crosspoints[req.from_crosspoint_id];
            const toCP = crosspoints[req.to_crosspoint_id];

            return (
              <div key={req.id} className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.member_id ?? 'No member ID'} {user?.phone ? `• ${user.phone}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(req.request_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/[0.04] rounded-lg mb-4">
                  <div className="flex-1 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gray-200 flex items-center justify-center mb-2">
                      <Home className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="font-medium text-white text-sm">{fromCP?.name}</p>
                    <p className="text-xs text-gray-500">{fromCP?.area}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[#BF0A30] flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#BF0A30]/10 flex items-center justify-center mb-2">
                      <Home className="w-6 h-6 text-[#BF0A30]" />
                    </div>
                    <p className="font-medium text-white text-sm">{toCP?.name}</p>
                    <p className="text-xs text-gray-500">{toCP?.area}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Reason for transfer:</p>
                  <p className="text-white/70">{req.reason}</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/[0.04]">
                  <button
                    disabled={processing === req.id}
                    onClick={() => handleAction(req.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />Approve Transfer
                  </button>
                  <button
                    disabled={processing === req.id}
                    onClick={() => handleAction(req.id, 'declined')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 dark:border-[#2D2D2D] text-white/70 font-medium rounded-lg hover:bg-white/[0.06] disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-12 text-center mb-8">
          <p className="text-gray-500">No pending transfer requests</p>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Transfer History</h2>
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-white/[0.04]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {processed.map((req) => {
                  const user = profiles[req.user_id];
                  const fromCP = crosspoints[req.from_crosspoint_id];
                  const toCP = crosspoints[req.to_crosspoint_id];
                  return (
                    <tr key={req.id}>
                      <td className="py-3 px-4 font-medium">{user?.first_name} {user?.last_name}</td>
                      <td className="py-3 px-4 text-sm">{fromCP?.name}</td>
                      <td className="py-3 px-4 text-sm">{toCP?.name}</td>
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
