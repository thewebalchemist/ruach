import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, Plus, Phone, Mail, UserPlus, UserMinus, Edit } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments, mockMembers } from '@/data';

export default function DepartmentMembersPage() {
  const router = useRouter();
  const { deptId } = router.query;
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const department = mockDepartments.find(d => d.id === deptId);
  
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  const deptMembers = mockMembers.filter(m => 
    m.departments.some(d => d.departmentId === deptId)
  ).map(m => ({
    ...m,
    deptRole: m.departments.find(d => d.departmentId === deptId)?.role || 'member',
    joinedDate: m.departments.find(d => d.departmentId === deptId)?.joinedDate || '',
  }));

  const filtered = deptMembers.filter(m => {
    const matchesSearch = `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.deptRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const leaders = deptMembers.filter(m => m.deptRole === 'leader').length;

  return (
    <DepartmentLayout department={department} title="Members">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Members</h1>
          <p className="text-gray-500">{deptMembers.length} members serving in {department.name}</p>
        </div>
        <Link href={`/department/${deptId}/members/new`} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]">
          <UserPlus className="w-4 h-4" />Add Member
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{deptMembers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Leaders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaders}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Sub-teams</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{department.subTeams?.length || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <select 
            className="px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="leader">Leaders</option>
            <option value="member">Members</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-[#252525]">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-[#252525]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500">{member.memberId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Phone className="w-3 h-3" />{member.phone}</p>
                      {member.email && <p className="flex items-center gap-1 text-gray-500 text-xs mt-1"><Mail className="w-3 h-3" />{member.email}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      member.deptRole === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                    }`}>{member.deptRole}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500" title="Remove"><UserMinus className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </div>
    </DepartmentLayout>
  );
}
