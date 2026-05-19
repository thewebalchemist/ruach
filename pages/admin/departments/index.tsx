import { useState } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronRight, AlertCircle } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { mockDepartments, getPendingJoinRequests, getMemberById } from '@/data';

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');
  const pendingRequests = getPendingJoinRequests();

  const filtered = mockDepartments.filter(d =>
    `${d.name} ${d.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalServing = mockDepartments.reduce((s, d) => s + d.memberCount, 0);

  return (
    <AdminLayout title="Departments">
      <PageHeader title="Departments" subtitle={`${mockDepartments.length} departments serving the church`} />

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">{pendingRequests.length} pending join requests</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">Members waiting to join departments</p>
              </div>
            </div>
            <Link href="/admin/departments/requests" className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700">Review Requests</Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Departments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockDepartments.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Serving</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalServing}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequests.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search departments..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => {
          const leader = getMemberById(dept.leaderId);
          const deptRequests = pendingRequests.filter(r => r.departmentId === dept.id);
          
          return (
            <Link key={dept.id} href={`/admin/departments/${dept.id}`}>
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{dept.icon}</div>
                  {deptRequests.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">{deptRequests.length} pending</span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dept.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{dept.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <Users className="w-4 h-4" />
                  <span>{dept.memberCount} members</span>
                </div>

                {dept.subTeams && dept.subTeams.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Sub-teams:</p>
                    <div className="flex flex-wrap gap-1">
                      {dept.subTeams.slice(0, 3).map(team => (
                        <span key={team.id} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">{team.name}</span>
                      ))}
                      {dept.subTeams.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">+{dept.subTeams.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {leader && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2D2D2D]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold">{leader.firstName[0]}{leader.lastName[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{leader.firstName} {leader.lastName}</p>
                        <p className="text-xs text-gray-500">HOD</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
}
