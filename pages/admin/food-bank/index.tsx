import { useState, useEffect, useCallback } from 'react';
import { Package, Check, X, Clock, Users, Calendar, Home, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

type Status = 'pending' | 'approved' | 'fulfilled' | 'declined';

interface FoodBankRequest {
  id: string; request_date: string; status: Status; notes: string | null;
  crosspoints: { name: string } | null;
  profiles: { first_name: string; last_name: string } | null;
  food_bank_beneficiaries: { id: string; name: string }[];
}

export default function FoodBankPage() {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [requests, setRequests] = useState<FoodBankRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('food_bank_requests')
      .select('id, request_date, status, notes, crosspoints(name), profiles!requested_by_id(first_name, last_name), food_bank_beneficiaries(id, name)')
      .order('request_date', { ascending: false });
    setRequests((data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    totalBeneficiaries: requests.reduce((s, r) => s + r.food_bank_beneficiaries.length, 0),
  };

  async function updateStatus(id: string, status: Status) {
    setBusyId(id);
    await supabase.from('food_bank_requests').update({ status }).eq('id', id);
    setBusyId(null);
    load();
  }

  return (
    <AdminLayout title="Food Bank">
      <PageHeader title="Food Bank Requests" subtitle="Manage food assistance requests from crosspoints" />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-amber-500 border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-blue-500 border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border-l-4 border-l-green-500 border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Fulfilled</p>
          <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Beneficiaries</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBeneficiaries}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'fulfilled', 'declined'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
              filter === status ? 'bg-[#BF0A30] text-white' : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="space-y-4">
        {filtered.map((request) => (
          <div key={request.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/10 flex items-center justify-center"><Package className="w-6 h-6 text-[#BF0A30]" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <p className="font-semibold text-gray-900 dark:text-white">{request.crosspoints?.name ?? '—'}</p>
                  </div>
                  <p className="text-sm text-gray-500">Requested by {request.profiles?.first_name ?? 'Unknown'} {request.profiles?.last_name ?? ''}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>{request.status}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Users className="w-4 h-4" /><span>Beneficiaries ({request.food_bank_beneficiaries.length})</span></div>
                <div className="space-y-1">
                  {request.food_bank_beneficiaries.map((b) => (
                    <p key={b.id} className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</p>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Calendar className="w-4 h-4" /><span>Request Date</span></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(request.request_date).toLocaleDateString()}</p>
                {request.notes && <p className="text-sm text-gray-500 mt-2">{request.notes}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {request.status === 'pending' && <Clock className="w-4 h-4" />}
                {request.status === 'fulfilled' && <Check className="w-4 h-4 text-green-500" />}
                <span className="capitalize">{request.status}</span>
              </div>
              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(request.id, 'approved')} disabled={busyId === request.id} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"><Check className="w-4 h-4" />Approve</button>
                    <button onClick={() => updateStatus(request.id, 'declined')} disabled={busyId === request.id} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"><X className="w-4 h-4" />Decline</button>
                  </>
                )}
                {request.status === 'approved' && (
                  <button onClick={() => updateStatus(request.id, 'fulfilled')} disabled={busyId === request.id} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50"><Package className="w-4 h-4" />Mark Fulfilled</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No food bank requests found</p>
        </div>
      )}
    </AdminLayout>
  );
}
