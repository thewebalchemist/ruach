import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, MapPin, Calendar, Users, Phone, Plus, UserMinus } from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { mockCrosspoints, mockMembers, getMemberById } from '@/data';

export default function CrosspointDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const crosspoint = mockCrosspoints.find(cp => cp.id === id);
  const leader = crosspoint ? getMemberById(crosspoint.leaderId) : null;
  const assistant = crosspoint?.assistantId ? getMemberById(crosspoint.assistantId) : null;
  const treasurer = crosspoint?.treasurerId ? getMemberById(crosspoint.treasurerId) : null;

  // Get members in this crosspoint
  const members = mockMembers.filter(m => m.crosspoint?.crosspointId === id);

  if (!crosspoint) {
    return (
      <AdminLayout title="Crosspoint Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Crosspoint not found</p>
          <Link href="/admin/crosspoints" className="text-[#BF0A30] hover:underline mt-4 inline-block">Back to Crosspoints</Link>
        </div>
      </AdminLayout>
    );
  }

  const capacityPct = (crosspoint.memberCount / crosspoint.maxMembers) * 100;

  return (
    <AdminLayout title={crosspoint.name}>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/crosspoints" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoints
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{crosspoint.name}</h1>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${crosspoint.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{crosspoint.status}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{crosspoint.location}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{crosspoint.meetingDay}s at {crosspoint.meetingTime}</span>
            </div>
          </div>
          <Link href={`/admin/crosspoints/${id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">
            <Edit className="w-4 h-4" />Edit
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Capacity */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Capacity</h2>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{crosspoint.memberCount}/{crosspoint.maxMembers}</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${capacityPct}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{crosspoint.maxMembers - crosspoint.memberCount} slots available</p>
          </div>

          {/* Members List */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Members ({members.length})</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                <Plus className="w-4 h-4" />Add Member
              </button>
            </div>
            {members.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <Link href={`/admin/members/${member.id}`} className="font-medium text-gray-900 dark:text-white hover:text-[#BF0A30]">
                          {member.firstName} {member.lastName}
                        </Link>
                        <p className="text-sm text-gray-500">{member.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        member.crosspoint?.role === 'leader' ? 'bg-amber-100 text-amber-800' :
                        member.crosspoint?.role === 'assistant' ? 'bg-blue-100 text-blue-800' :
                        member.crosspoint?.role === 'treasurer' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>{member.crosspoint?.role}</span>
                      <button className="p-1.5 text-gray-400 hover:text-red-500"><UserMinus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No members assigned yet</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leadership */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Leadership</h2>
            <div className="space-y-4">
              {leader && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Leader</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                      {leader.firstName[0]}{leader.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{leader.firstName} {leader.lastName}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{leader.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              {assistant && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Assistant</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {assistant.firstName[0]}{assistant.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{assistant.firstName} {assistant.lastName}</p>
                      <p className="text-sm text-gray-500">{assistant.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              {treasurer && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Treasurer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                      {treasurer.firstName[0]}{treasurer.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{treasurer.firstName} {treasurer.lastName}</p>
                      <p className="text-sm text-gray-500">{treasurer.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Details */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Meeting Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Day</span>
                <span className="font-medium">{crosspoint.meetingDay}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{crosspoint.meetingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue</span>
                <span className="font-medium">{crosspoint.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Area</span>
                <span className="font-medium">{crosspoint.area}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Take Attendance</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">View Module</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Request Food Bank</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
