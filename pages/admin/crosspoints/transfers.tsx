import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, X, Clock, Home, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface TransferRequest {
  id: string; user_id: string; reason: string; status: string; request_date: string;
  profiles: { first_name: string; last_name: string; phone: string | null; member_id: string | null } | null;
  from_crosspoint: { id: string; name: string; area: string } | null;
  to_crosspoint: { id: string; name: string; area: string } | null;
}

export default function TransfersPage() {
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('transfer_requests')
      .select('id, user_id, reason, status, request_date, profiles(first_name, last_name, phone, member_id), from_crosspoint:crosspoints!from_crosspoint_id(id, name, area), to_crosspoint:crosspoints!to_crosspoint_id(id, name, area)')
      .order('request_date', { ascending: false });
    setRequests((data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = requests.filter(t => t.status === 'pending');
  const processed = requests.filter(t => t.status !== 'pending');

  async function handleAction(id: string, status: 'approved' | 'declined') {
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/crosspoint-transfers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        await load();
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

  return (
    <AdminLayout title="Transfer Requests">
      <div className="mb-6">
        <Link href="/admin/crosspoints" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoints
        </Link>
        <PageHeader title="Crosspoint Transfers" subtitle={`${pending.length} pending transfer requests`} />
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
                    {req.profiles?.first_name[0]}{req.profiles?.last_name[0]}
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

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#252525] rounded-lg mb-4">
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gray-200 dark:bg-[#2D2D2D] flex items-center justify-center mb-2">
                    <Home className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{req.from_crosspoint?.name}</p>
                  <p className="text-xs text-gray-500">{req.from_crosspoint?.area}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-[#BF0A30] flex-shrink-0" />
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#BF0A30]/10 flex items-center justify-center mb-2">
                    <Home className="w-6 h-6 text-[#BF0A30]" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{req.to_crosspoint?.name}</p>
                  <p className="text-xs text-gray-500">{req.to_crosspoint?.area}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Reason for transfer:</p>
                <p className="text-gray-700 dark:text-gray-300">{req.reason}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
                <button onClick={() => handleAction(req.id, 'approved')} disabled={processing === req.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
                  <Check className="w-4 h-4" />{processing === req.id ? 'Processing…' : 'Approve Transfer'}
                </button>
                <button onClick={() => handleAction(req.id, 'declined')} disabled={processing === req.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50">
                  <X className="w-4 h-4" />Decline
                </button>
              </div>
            </div>
          ))}
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
              <tbody className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {processed.map((req) => (
                  <tr key={req.id}>
                    <td className="py-3 px-4 font-medium">{req.profiles?.first_name} {req.profiles?.last_name}</td>
                    <td className="py-3 px-4 text-sm">{req.from_crosspoint?.name}</td>
                    <td className="py-3 px-4 text-sm">{req.to_crosspoint?.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(req.request_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {req.status}
                      </span>
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
