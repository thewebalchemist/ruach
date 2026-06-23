import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, UserPlus, Mail, Phone, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface DepartmentRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  leader_id: string | null;
  member_count: number;
}

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  member_id: string | null;
}

interface MembershipRow {
  id: string;
  user_id: string;
  role: string;
  profiles: ProfileRow;
}

export default function DepartmentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<DepartmentRow | null>(null);
  const [leader, setLeader] = useState<ProfileRow | null>(null);
  const [members, setMembers] = useState<MembershipRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    if (id) loadData();
  }, [authLoading, profile, id]);

  async function loadData() {
    setLoading(true);

    const [{ data: deptData }, { data: memberData }] = await Promise.all([
      db.from('departments').select('*').eq('id', id).single(),
      db.from('department_memberships')
        .select('id, user_id, role, profiles(id, first_name, last_name, phone, email, member_id)')
        .eq('department_id', id),
    ]);

    if (deptData) {
      const dept = deptData as DepartmentRow;
      setDepartment(dept);

      // Fetch leader profile if set
      if (dept.leader_id) {
        const { data: leaderData } = await db
          .from('profiles')
          .select('id, first_name, last_name, phone, email, member_id')
          .eq('id', dept.leader_id)
          .single();
        setLeader((leaderData as ProfileRow) ?? null);
      }
    }

    setMembers((memberData ?? []) as MembershipRow[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

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
        <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Departments
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#BF0A30]/10 flex items-center justify-center text-4xl">
              {department.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{department.name}</h1>
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
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-white">{department.member_count ?? members.length}</p>
            </div>
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-white">{members.length}</p>
            </div>
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">Yes</p>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Members ({members.length})</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                <UserPlus className="w-4 h-4" />Add Member
              </button>
            </div>
            {members.length > 0 ? (
              <div className="divide-y divide-white/[0.06]">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                        {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                      </div>
                      <div>
                        <Link href={`/admin/members/${member.user_id}`} className="font-medium text-white hover:text-[#BF0A30]">
                          {member.profiles?.first_name} {member.profiles?.last_name}
                        </Link>
                        <p className="text-sm text-gray-500">{member.profiles?.phone}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      member.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-white/5 text-gray-700'
                    }`}>{member.role}</span>
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
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Head of Department</h2>
            {leader ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                    {leader.first_name[0]}{leader.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{leader.first_name} {leader.last_name}</p>
                    <p className="text-sm text-gray-500">{leader.member_id}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-white/50">
                    <Phone className="w-4 h-4" />{leader.phone}
                  </p>
                  {leader.email && (
                    <p className="flex items-center gap-2 text-white/50">
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
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-white/10 rounded-lg hover:bg-white/[0.06]">Send Announcement</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-white/10 rounded-lg hover:bg-white/[0.06]">Schedule Meeting</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-white/10 rounded-lg hover:bg-white/[0.06]">View Reports</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-white/10 rounded-lg hover:bg-white/[0.06]">Export Members</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
