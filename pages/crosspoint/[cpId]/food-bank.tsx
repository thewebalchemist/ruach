import { useState } from 'react';
import { useRouter } from 'next/router';
import { Plus, Check, Package, Clock, ShoppingBag } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { mockCrosspoints } from '@/data';

const MOCK_DATA = true;

type RequestStatus = 'pending' | 'approved' | 'fulfilled';

interface FoodBankRequest {
  id: string;
  name: string;
  phone: string;
  date: string;
  itemsRequested: string;
  status: RequestStatus;
  notes: string;
}

const mockFoodBankRequests: FoodBankRequest[] = [
  { id: 'fbr-001', name: 'Ruth Akinyi', phone: '+254722001001', date: '2026-05-07', itemsRequested: 'Maize flour (5kg), Cooking oil (2L), Sugar (2kg)', status: 'pending', notes: 'Single mother, 3 children' },
  { id: 'fbr-002', name: 'Joseph Otieno', phone: '+254722001002', date: '2026-05-05', itemsRequested: 'Rice (5kg), Beans (2kg), Salt', status: 'approved', notes: '' },
  { id: 'fbr-003', name: 'Esther Mutua', phone: '+254722001003', date: '2026-04-28', itemsRequested: 'Maize flour (10kg), Lentils (1kg), Cooking fat', status: 'fulfilled', notes: 'Collected on 2026-04-30' },
  { id: 'fbr-004', name: 'Daniel Kamau', phone: '+254722001004', date: '2026-04-20', itemsRequested: 'Unga (5kg), Rice (2kg), Sugar (1kg)', status: 'fulfilled', notes: 'Collected on 2026-04-22' },
];

const statusConfig: Record<RequestStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  fulfilled: { label: 'Fulfilled', color: 'bg-green-100 text-green-800' },
};

export default function FoodBankPage() {
  const router = useRouter();
  const { cpId } = router.query;
  const [requests, setRequests] = useState<FoodBankRequest[]>(mockFoodBankRequests);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | RequestStatus>('all');
  const [form, setForm] = useState({ name: '', phone: '', itemsRequested: '', notes: '' });

  const crosspoint = mockCrosspoints.find(c => c.id === cpId);

  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
  };

  function updateStatus(id: string, status: RequestStatus) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  function handleSubmit() {
    if (!form.name || !form.phone || !form.itemsRequested) return;
    const newReq: FoodBankRequest = {
      id: `fbr-${Date.now()}`,
      name: form.name,
      phone: form.phone,
      date: new Date().toISOString().split('T')[0],
      itemsRequested: form.itemsRequested,
      status: 'pending',
      notes: form.notes,
    };
    setRequests(prev => [newReq, ...prev]);
    setForm({ name: '', phone: '', itemsRequested: '', notes: '' });
    setShowModal(false);
  }

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Food Bank">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Food Bank Requests</h1>
          <p className="text-gray-500">Manage community food assistance requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
        >
          <Plus className="w-4 h-4" />New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <ShoppingBag className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Requests</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-amber-200 dark:border-amber-800 p-4">
          <Clock className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <Package className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
          <p className="text-sm text-gray-500">Approved</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-green-200 dark:border-green-800 p-4">
          <Check className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
          <p className="text-sm text-gray-500">Fulfilled</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'fulfilled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                filterStatus === s
                  ? 'bg-[#BF0A30] text-white'
                  : 'border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
              }`}
            >
              {s === 'all' ? `All (${stats.total})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${stats[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {filtered.map(req => (
            <div key={req.id} className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {req.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 dark:text-white">{req.name}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig[req.status].color}`}>
                        {statusConfig[req.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{req.phone} &bull; {new Date(req.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      <span className="font-medium">Items: </span>{req.itemsRequested}
                    </p>
                    {req.notes && (
                      <p className="text-xs text-gray-500 mt-1">{req.notes}</p>
                    )}
                  </div>
                </div>
                {req.status !== 'fulfilled' && (
                  <div className="flex gap-2 flex-shrink-0">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(req.id, 'approved')}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Approve
                      </button>
                    )}
                    {req.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(req.id, 'fulfilled')}
                        className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-500">No requests found</div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">New Food Bank Request</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Applicant name"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+254700000000"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Items Needed</label>
                <textarea
                  rows={3}
                  placeholder="List the food items needed..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none"
                  value={form.itemsRequested}
                  onChange={e => setForm(f => ({ ...f, itemsRequested: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="Additional context..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </CrosspointLayout>
  );
}
