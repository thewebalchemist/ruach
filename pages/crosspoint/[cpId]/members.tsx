import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, UserPlus, Phone, Mail, Edit, UserMinus } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { mockCrosspoints, mockMembers } from '@/data';

export default function CrosspointMembersPage() {
  const router = useRouter();
  const { cpId } = router.query;
  const [search, setSearch] = useState('');
  
  const crosspoint = mockCrosspoints.find(c => c.id === cpId);
  
  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  const cpMembers = mockMembers.filter(m => m.crosspoint?.crosspointId === cpId).map(m => ({
    ...m,
    cpRole: m.crosspoint?.role || 'member'
  }));

  const filtered = cpMembers.filter(m =>
    `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Members">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Crosspoint Members</h1>
          <p className="text-gray-500">{cpMembers.length} members in {crosspoint.name}</p>
        </div>
        <Link href={`/crosspoint/${cpId}/members/new`} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <UserPlus className="w-4 h-4" />Add Member
        </Link>
      </div>

      {/* Capacity */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Capacity</span>
          <span className="font-medium">{crosspoint.memberCount} / {crosspoint.maxMembers}</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${(crosspoint.memberCount / crosspoint.maxMembers) >= 0.9 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(crosspoint.memberCount / crosspoint.maxMembers) * 100}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">{crosspoint.maxMembers - crosspoint.memberCount} slots available</p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {filtered.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.phone}</span>
                    {member.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  member.cpRole === 'leader' ? 'bg-amber-100 text-amber-800' :
                  member.cpRole === 'assistant' ? 'bg-blue-100 text-blue-800' :
                  member.cpRole === 'treasurer' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-700'
                }`}>{member.cpRole}</span>
                <button className="p-1.5 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </div>
    </CrosspointLayout>
  );
}
