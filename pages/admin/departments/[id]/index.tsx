import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, UserPlus, Mail, Phone, Calendar } from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { mockDepartments, mockMembers, getMemberById } from '@/data';

export default function DepartmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const department = mockDepartments.find(d => d.id === id);
  const leader = department ? getMemberById(department.leaderId) : null;

  // Get members in this department
  const members = mockMembers.filter(m => 
    m.departments.some(d => d.departmentId === id)
  ).map(m => ({
    ...m,
    deptRole: m.departments.find(d => d.departmentId === id)?.role || 'member'
  }));

  if (!department) {
    return (
      <AdminLayout title="Department Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Department not found</p>
          <Link href="/admin/departments" className="text-[#BF0A30] hover:underline mt-4 inline-block">Back to Departments</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={department.name}>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Departments
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#BF0A30]/10 flex items-center justify-center text-4xl">
              {department.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{department.name}</h1>
              <p className="text-gray-500 mt-1">{department.description}</p>
            </div>
          </div>
          <Link href={`/admin/departments/${id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">
            <Edit className="w-4 h-4" />Edit
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{department.memberCount}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
              <p className="text-sm text-gray-500">Sub-teams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{department.subTeams?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">Yes</p>
            </div>
          </div>

          {/* Sub-teams */}
          {department.subTeams && department.subTeams.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Sub-teams</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {department.subTeams.map(team => (
                  <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{team.name}</p>
                      <p className="text-sm text-gray-500">{team.memberCount} members</p>
                    </div>
                    <Link href={`/admin/departments/${id}/teams/${team.id}`} className="text-sm text-[#BF0A30] hover:underline">View</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Members ({members.length})</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                <UserPlus className="w-4 h-4" />Add Member
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
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      member.deptRole === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                    }`}>{member.deptRole}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No members in this department</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* HOD */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Head of Department</h2>
            {leader ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                    {leader.firstName[0]}{leader.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{leader.firstName} {leader.lastName}</p>
                    <p className="text-sm text-gray-500">{leader.memberId}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />{leader.phone}
                  </p>
                  {leader.email && (
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />{leader.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No HOD assigned</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Send Announcement</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Schedule Meeting</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">View Reports</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Export Members</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
