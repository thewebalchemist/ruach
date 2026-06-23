import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle, Search, User, Calendar, MapPin, Building, Loader2 } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

const branchLabels: Record<string, string> = {
  'ruach-tabernacle': 'Ruach Tabernacle',
  'ruach-east': 'Ruach East',
  'ruach-west': 'Ruach West',
  'ruach-south': 'Ruach South',
  'ruach-rivers': 'Ruach Rivers',
};

const zoneLabels: Record<string, string> = {
  'south': 'South Zone',
  'east': 'East Zone',
  'north': 'North Zone',
  'west': 'West Zone',
};

export default function LegacyRequestsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchRequests() {
    setLoading(true);
    const { data } = await db
      .from('legacy_member_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading && profile) fetchRequests();
  }, [authLoading, profile]);

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = (r.full_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const verifiedCount = requests.filter(r => r.status === 'verified').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const calculateMemberNumber = (yearsAsMember: number): string => {
    const baseNumber = Math.max(1, 100 - (yearsAsMember * 2));
    return `RT-${String(baseNumber).padStart(5, '0')}`;
  };

  const handleVerify = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/verify-legacy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ requestId: selectedRequest.id, status: 'verified', notes: reviewNotes }),
      });
      if (!res.ok) throw new Error('Failed to verify request');
      await fetchRequests();
      // Update selected request to reflect new status
      setSelectedRequest((prev: any) => prev ? { ...prev, status: 'verified', review_notes: reviewNotes, assigned_member_id: calculateMemberNumber(prev.years_as_member) } : null);
      setReviewNotes('');
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/verify-legacy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ requestId: selectedRequest.id, status: 'rejected', notes: reviewNotes }),
      });
      if (!res.ok) throw new Error('Failed to reject request');
      await fetchRequests();
      setSelectedRequest((prev: any) => prev ? { ...prev, status: 'rejected', review_notes: reviewNotes } : null);
      setReviewNotes('');
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ConnectLayout title="Legacy Verification">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#BF0A30]" />
        </div>
      </ConnectLayout>
    );
  }

  if (!profile) {
    return (
      <ConnectLayout title="Legacy Verification">
        <div className="flex items-center justify-center py-32">
          <p className="text-gray-500">Please sign in to view legacy requests.</p>
        </div>
      </ConnectLayout>
    );
  }

  return (
    <ConnectLayout title="Legacy Verification">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/connect/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-1">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Legacy Member Verification</h1>
            <p className="text-sm text-gray-500">Review and verify existing members who need a member number</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="text-sm text-amber-600">Pending</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{verifiedCount}</p>
            <p className="text-sm text-green-600">Verified</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
            <p className="text-sm text-red-600">Rejected</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-[#252525] p-1 rounded-lg">
                {(['all', 'pending', 'verified', 'rejected'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize ${
                      filterStatus === status ? 'bg-white dark:bg-[#1A1A1A] shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D] max-h-[600px] overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No requests found</p>
                </div>
              ) : (
                filteredRequests.map(request => (
                  <button
                    key={request.id}
                    onClick={() => { setSelectedRequest(request); setReviewNotes(''); }}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors ${
                      selectedRequest?.id === request.id ? 'bg-[#BF0A30]/5 border-l-4 border-[#BF0A30]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{request.full_name}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        request.status === 'verified' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{request.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Joined {request.year_joined} • {request.years_as_member} years</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Request Details */}
          <div className="lg:col-span-3">
            {selectedRequest ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
                <div className="p-6 border-b border-gray-200 dark:border-[#2D2D2D]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedRequest.full_name}</h2>
                      <p className="text-gray-500">{selectedRequest.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1 ${
                      selectedRequest.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      selectedRequest.status === 'verified' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedRequest.status === 'pending' && <Clock className="w-4 h-4" />}
                      {selectedRequest.status === 'verified' && <CheckCircle className="w-4 h-4" />}
                      {selectedRequest.status === 'rejected' && <XCircle className="w-4 h-4" />}
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">{selectedRequest.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Branch</p>
                          <p className="font-medium">{branchLabels[selectedRequest.branch]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Zone</p>
                          <p className="font-medium">{zoneLabels[selectedRequest.crosspoint_zone]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Requested</p>
                          <p className="font-medium">{new Date(selectedRequest.requested_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Membership Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Membership Details</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Connect Cohort Attended</span>
                        <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedRequest.cohort_attended}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Year Joined Ruach</span>
                        <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedRequest.year_joined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Years as Member</span>
                        <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedRequest.years_as_member} years</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {selectedRequest.additional_info && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Additional Information</h3>
                      <p className="p-4 bg-gray-50 dark:bg-[#252525] rounded-lg text-gray-700 dark:text-gray-300">
                        {selectedRequest.additional_info}
                      </p>
                    </div>
                  )}

                  {/* Suggested Member Number */}
                  {selectedRequest.status === 'pending' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">Suggested Member Number</h3>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{calculateMemberNumber(selectedRequest.years_as_member)}</p>
                      <p className="text-xs text-green-600 mt-1">Based on {selectedRequest.years_as_member} years of membership</p>
                    </div>
                  )}

                  {/* Already Processed */}
                  {selectedRequest.status !== 'pending' && (
                    <div className={`rounded-xl p-4 ${
                      selectedRequest.status === 'verified' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <h3 className={`text-sm font-semibold mb-2 ${selectedRequest.status === 'verified' ? 'text-green-800' : 'text-red-800'}`}>
                        {selectedRequest.status === 'verified' ? 'Verified' : 'Rejected'}
                      </h3>
                      {selectedRequest.assigned_member_id && (
                        <p className="text-lg font-bold text-green-700 mb-2">Member ID: {selectedRequest.assigned_member_id}</p>
                      )}
                      {selectedRequest.review_notes && (
                        <p className="text-sm text-gray-600">Notes: {selectedRequest.review_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Review Actions */}
                  {selectedRequest.status === 'pending' && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-[#2D2D2D]">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Notes (optional)</label>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={3}
                          placeholder="Add any notes about this verification..."
                          className="w-full px-4 py-3 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleReject}
                          disabled={isProcessing}
                          className="flex-1 py-3 border-2 border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={handleVerify}
                          disabled={isProcessing}
                          className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing...' : 'Verify & Assign Number'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ConnectLayout>
  );
}
