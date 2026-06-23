import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Package, Check, X, Clock, Users, Calendar, Home, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface BeneficiaryRow {
  member_id: string;
  name: string;
}

interface FoodBankRow {
  id: string;
  crosspoint_id: string;
  requested_by_id: string;
  beneficiaries: BeneficiaryRow[];
  request_date: string;
  status: string;
  approved_date: string | null;
  fulfilled_date: string | null;
  notes: string | null;
}

interface CrosspointRow {
  id: string;
  name: string;
}

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
}

export default function FoodBankPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FoodBankRow[]>([]);
  const [crosspoints, setCrosspoints] = useState<Record<string, CrosspointRow>>({});
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setLoading(true);

    // Try querying food_bank_requests -- table may not exist
    const { data: fbData, error } = await db
      .from('food_bank_requests')
      .select('*')
      .order('request_date', { ascending: false });

    if (error) {
      // Table doesn't exist or query failed -- show empty state
      setRequests([]);
      setLoading(false);
      return;
    }

    const rows = (fbData ?? []) as FoodBankRow[];
    setRequests(rows);

    // Fetch crosspoint names
    const cpIds = [...new Set(rows.map(r => r.crosspoint_id).filter(Boolean))];
    if (cpIds.length > 0) {
      const { data: cpData } = await db
        .from('crosspoints')
        .select('id, name')
        .in('id', cpIds);

      const cpMap: Record<string, CrosspointRow> = {};
      for (const cp of (cpData ?? []) as CrosspointRow[]) {
        cpMap[cp.id] = cp;
      }
      setCrosspoints(cpMap);
    }

    // Fetch requester profiles
    const userIds = [...new Set(rows.map(r => r.requested_by_id).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profileData } = await db
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      const profileMap: Record<string, ProfileRow> = {};
      for (const p of (profileData ?? []) as ProfileRow[]) {
        profileMap[p.id] = p;
      }
      setProfiles(profileMap);
    }

    setLoading(false);
  }

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    totalBeneficiaries: requests.reduce((s, r) => s + (r.beneficiaries?.length ?? 0), 0),
  };

  return (
    <AdminLayout title="Food Bank">
      <PageHeader
        title="Food Bank Requests"
        subtitle="Manage food assistance requests from crosspoints"
        actions={<Link href="/admin/food-bank/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg"><Plus className="w-4 h-4" />New Request</Link>}
      />

      {/* Stats */}
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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'fulfilled', 'declined'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
              filter === status
                ? 'bg-[#BF0A30] text-white'
                : 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] text-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      ) : (
        <>
          {/* Requests List */}
          <div className="space-y-4">
            {filtered.map((request) => {
              const crosspoint = crosspoints[request.crosspoint_id];
              const requestedBy = profiles[request.requested_by_id];
              const beneficiaries = request.beneficiaries ?? [];

              return (
                <div key={request.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#BF0A30]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-400" />
                          <p className="font-semibold text-gray-900 dark:text-white">{crosspoint?.name ?? 'Unknown Crosspoint'}</p>
                        </div>
                        <p className="text-sm text-gray-500">Requested by {requestedBy ? `${requestedBy.first_name} ${requestedBy.last_name}` : 'Unknown'}</p>
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
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Users className="w-4 h-4" />
                        <span>Beneficiaries ({beneficiaries.length})</span>
                      </div>
                      <div className="space-y-1">
                        {beneficiaries.map((b: BeneficiaryRow, i: number) => (
                          <p key={i} className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</p>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Request Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(request.request_date).toLocaleDateString()}</p>
                      {request.notes && (
                        <p className="text-sm text-gray-500 mt-2">{request.notes}</p>
                      )}
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
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Check className="w-4 h-4" />Approve
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                            <X className="w-4 h-4" />Decline
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">
                          <Package className="w-4 h-4" />Mark Fulfilled
                        </button>
                      )}
                      <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">View Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No food bank requests found</p>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
