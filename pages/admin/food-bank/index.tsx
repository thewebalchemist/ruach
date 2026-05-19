import { useState } from 'react';
import Link from 'next/link';
import { Plus, Package, Check, X, Clock, Users, Calendar, Home } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { mockCrosspoints, getMemberById } from '@/data';

// Mock food bank data
const mockFoodBankRequests = [
  {
    id: 'fb-001',
    crosspointId: 'cp-001',
    requestedById: 'user-003',
    beneficiaries: [
      { memberId: 'user-010', name: 'Jane Kamau' },
      { memberId: 'user-011', name: 'Peter Ochieng' },
    ],
    requestDate: '2026-01-28',
    status: 'pending',
    notes: 'Single mothers needing support this month',
  },
  {
    id: 'fb-002',
    crosspointId: 'cp-002',
    requestedById: 'user-010',
    beneficiaries: [
      { memberId: 'user-020', name: 'Mary Wanjiku' },
    ],
    requestDate: '2026-01-25',
    status: 'approved',
    approvedDate: '2026-01-26',
    notes: 'Recently lost job',
  },
  {
    id: 'fb-003',
    crosspointId: 'cp-004',
    requestedById: 'user-006',
    beneficiaries: [
      { memberId: 'user-030', name: 'James Mwangi' },
      { memberId: 'user-031', name: 'Grace Njeri' },
      { memberId: 'user-032', name: 'David Omondi' },
    ],
    requestDate: '2026-01-20',
    status: 'fulfilled',
    fulfilledDate: '2026-01-22',
    notes: 'Families affected by job losses',
  },
];

export default function FoodBankPage() {
  const [filter, setFilter] = useState('all');

  const filtered = mockFoodBankRequests.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    total: mockFoodBankRequests.length,
    pending: mockFoodBankRequests.filter(r => r.status === 'pending').length,
    approved: mockFoodBankRequests.filter(r => r.status === 'approved').length,
    fulfilled: mockFoodBankRequests.filter(r => r.status === 'fulfilled').length,
    totalBeneficiaries: mockFoodBankRequests.reduce((s, r) => s + r.beneficiaries.length, 0),
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

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.map((request) => {
          const crosspoint = mockCrosspoints.find(cp => cp.id === request.crosspointId);
          const requestedBy = getMemberById(request.requestedById);
          
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
                      <p className="font-semibold text-gray-900 dark:text-white">{crosspoint?.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">Requested by {requestedBy?.firstName} {requestedBy?.lastName}</p>
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
                    <span>Beneficiaries ({request.beneficiaries.length})</span>
                  </div>
                  <div className="space-y-1">
                    {request.beneficiaries.map((b, i) => (
                      <p key={i} className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</p>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Request Date</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(request.requestDate).toLocaleDateString()}</p>
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
    </AdminLayout>
  );
}
