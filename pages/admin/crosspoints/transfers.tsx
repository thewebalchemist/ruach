import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, X, Clock, Home } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { mockTransferRequests, getUserById, getCrosspointById } from '@/data';

export default function TransfersPage() {
  const pending = mockTransferRequests.filter(t => t.status === 'pending');
  const processed = mockTransferRequests.filter(t => t.status !== 'pending');

  return (
    <AdminLayout title="Transfer Requests">
      <div className="mb-6">
        <Link href="/admin/crosspoints" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoints
        </Link>
        <PageHeader title="Crosspoint Transfers" subtitle={`${pending.length} pending transfer requests`} />
      </div>

      {pending.length > 0 ? (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Requests</h2>
          {pending.map((req) => {
            // FIX: requests use userId (UserAccount.id), not memberId
            const user = getUserById(req.userId);
            const fromCP = getCrosspointById(req.fromCrosspointId);
            const toCP = getCrosspointById(req.toCrosspointId);

            return (
              <div key={req.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                      {user?.firstName[0]}{user?.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      {/* memberId may be undefined for non-members, phone always exists */}
                      <p className="text-sm text-gray-500">
                        {user?.memberId ?? 'No member ID'} • {user?.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(req.requestDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#252525] rounded-lg mb-4">
                  <div className="flex-1 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gray-200 dark:bg-[#2D2D2D] flex items-center justify-center mb-2">
                      <Home className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{fromCP?.name}</p>
                    <p className="text-xs text-gray-500">{fromCP?.area}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[#BF0A30] flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#BF0A30]/10 flex items-center justify-center mb-2">
                      <Home className="w-6 h-6 text-[#BF0A30]" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{toCP?.name}</p>
                    <p className="text-xs text-gray-500">{toCP?.area}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Reason for transfer:</p>
                  <p className="text-gray-700 dark:text-gray-300">{req.reason}</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                    <Check className="w-4 h-4" />Approve Transfer
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">
                    <X className="w-4 h-4" />Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center mb-8">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-gray-500">No pending transfer requests</p>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transfer History</h2>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-[#252525]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {processed.map((req) => {
                  const user = getUserById(req.userId);
                  const fromCP = getCrosspointById(req.fromCrosspointId);
                  const toCP = getCrosspointById(req.toCrosspointId);
                  return (
                    <tr key={req.id}>
                      <td className="py-3 px-4 font-medium">{user?.firstName} {user?.lastName}</td>
                      <td className="py-3 px-4 text-sm">{fromCP?.name}</td>
                      <td className="py-3 px-4 text-sm">{toCP?.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</td>
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