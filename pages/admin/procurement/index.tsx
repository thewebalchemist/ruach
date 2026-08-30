import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, X, Loader2, Check, XCircle, DollarSign, Clock, Package } from 'lucide-react';
import { AdminLayout, PageHeader, StatCard } from '@/components/connect/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ProcurementRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  amount_estimated: number | null;
  amount_approved: number | null;
  vendor: string | null;
  status: string;
  priority: string;
  department_id: string | null;
  crosspoint_id: string | null;
  receipt_url: string | null;
  notes: string | null;
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  requester: { first_name: string; last_name: string } | null;
  approver: { first_name: string; last_name: string } | null;
}

const CATEGORIES = ['office', 'equipment', 'maintenance', 'ministry', 'food-bank', 'events', 'general'] as const;
const STATUSES = ['pending', 'approved', 'rejected', 'purchased', 'delivered'] as const;
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

const categoryColors: Record<string, string> = {
  office: 'bg-blue-500/20 text-blue-400',
  equipment: 'bg-purple-500/20 text-purple-400',
  maintenance: 'bg-orange-500/20 text-orange-400',
  ministry: 'bg-emerald-500/20 text-emerald-400',
  'food-bank': 'bg-amber-500/20 text-amber-400',
  events: 'bg-pink-500/20 text-pink-400',
  general: 'bg-white/10 text-white/60',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
  purchased: 'bg-blue-500/20 text-blue-400',
  delivered: 'bg-green-500/20 text-green-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-white/10 text-white/50',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

export default function ProcurementPage() {
  const { loading: authLoading, profile, authHeaders } = useAdminAuth();
  const [requests, setRequests] = useState<ProcurementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    amount_estimated: '',
    vendor: '',
    priority: 'medium',
    department_id: '',
    notes: '',
  });

  useEffect(() => {
    if (authLoading) return;
    fetchRequests();
  }, [authLoading]);

  async function fetchRequests() {
    setLoading(true);
    const headers = authHeaders();
    const res = await fetch('/api/admin/procurement', { headers });
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const headers = authHeaders();
    const body = {
      ...form,
      amount_estimated: form.amount_estimated ? parseFloat(form.amount_estimated) : null,
      department_id: form.department_id || null,
    };
    const res = await fetch('/api/admin/procurement', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ title: '', description: '', category: 'general', amount_estimated: '', vendor: '', priority: 'medium', department_id: '', notes: '' });
      fetchRequests();
    }
    setSubmitting(false);
  }

  async function handleStatusUpdate(id: string, status: string) {
    const headers = authHeaders();
    const res = await fetch('/api/admin/procurement', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) fetchRequests();
  }

  const filtered = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved' || r.status === 'purchased' || r.status === 'delivered').length;
  const totalSpent = requests
    .filter(r => r.status === 'purchased' || r.status === 'delivered')
    .reduce((sum, r) => sum + (r.amount_approved ?? r.amount_estimated ?? 0), 0);

  const canApprove = profile?.role === 'admin' || profile?.role === 'pastor';

  if (authLoading || loading) {
    return (
      <AdminLayout title="Procurement">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Procurement">
      <PageHeader
        title="Procurement"
        subtitle="Manage purchase requests and track spending"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"
          >
            <Plus className="w-4 h-4" />New Request
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value={totalRequests} icon={<ShoppingCart className="w-6 h-6" />} />
        <StatCard title="Pending" value={pendingCount} subtitle="awaiting approval" icon={<Clock className="w-6 h-6" />} />
        <StatCard title="Approved" value={approvedCount} icon={<Check className="w-6 h-6" />} />
        <StatCard title="Total Spent" value={`R ${totalSpent.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-6 h-6" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {['all', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-[#BF0A30] text-white'
                  : 'bg-[#12151C] border border-white/[0.06] text-white/50 hover:text-white/70'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#12151C] border border-white/[0.06] text-white/70 text-xs rounded-lg px-3 py-1.5 outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#12151C] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-white/40 uppercase bg-white/[0.04]">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Date</th>
                {canApprove && <th className="py-3 px-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.04]">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-white">{r.title}</p>
                      {r.vendor && <p className="text-xs text-white/40">{r.vendor}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${categoryColors[r.category] || categoryColors.general}`}>
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/70 font-mono">
                    {r.amount_estimated != null ? `R ${Number(r.amount_estimated).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${priorityColors[r.priority] || priorityColors.medium}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[r.status] || statusColors.pending}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/50">
                    {r.requester ? `${r.requester.first_name} ${r.requester.last_name}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-white/40">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  {canApprove && (
                    <td className="py-3 px-4">
                      {r.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusUpdate(r.id, 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(r.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {r.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(r.id, 'purchased')}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          title="Mark Purchased"
                        >
                          <Package className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No procurement requests found</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#12151C] border border-white/[0.06] rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">New Procurement Request</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#BF0A30]/50"
                  placeholder="e.g. Office printer paper"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#BF0A30]/50 resize-none"
                  placeholder="Details about the request..."
                />
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#BF0A30]/50"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} className="bg-[#12151C]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#BF0A30]/50"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p} className="bg-[#12151C]">{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount + Vendor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Estimated Amount (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount_estimated}
                    onChange={e => setForm(f => ({ ...f, amount_estimated: e.target.value }))}
                    className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#BF0A30]/50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Vendor</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                    className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#BF0A30]/50"
                    placeholder="e.g. Takealot, Makro"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Department (optional)</label>
                <input
                  type="text"
                  value={form.department_id}
                  onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                  className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#BF0A30]/50"
                  placeholder="Department ID"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#BF0A30]/50 resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white/50 border border-white/[0.06] rounded-lg hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
