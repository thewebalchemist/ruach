import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Plus, Download, Eye, Edit, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface MemberRow {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  member_id: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  status: string;
  occupation: string | null;
  created_at: string;
}

export default function MembersPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=/admin/members'); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) {
      router.push('/');
      return;
    }
    loadMembers();
  }, [authLoading, profile]);

  useEffect(() => {
    if (!authLoading && profile) loadMembers();
  }, [search, roleFilter]);

  async function loadMembers() {
    setLoading(true);

    let query = db.from('profiles')
      .select('id, first_name, last_name, full_name, member_id, phone, email, role, status, occupation, created_at')
      .not('member_id', 'is', null)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,member_id.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    const { data, error } = await query;

    if (!error) {
      setMembers((data ?? []) as MemberRow[]);
    }

    // Total count (unfiltered)
    const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
      .not('member_id', 'is', null);
    setTotalCount(count ?? 0);

    setLoading(false);
  }

  return (
    <AdminLayout title="Members">
      <PageHeader
        title="Members"
        subtitle={`${totalCount} total members`}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]"><Download className="w-4 h-4" />Export</button>
            <Link href="/admin/members/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"><Plus className="w-4 h-4" />Add Member</Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, ID, or phone..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="member">Member</option>
            <option value="leader">Leader</option>
            <option value="admin">Admin</option>
            <option value="pastor">Pastor</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-[#252525]">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Member ID</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-[#252525]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-sm font-semibold">{member.first_name[0]}{member.last_name[0]}</div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{member.first_name} {member.last_name}</p>
                            <p className="text-xs text-gray-500">{member.occupation || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{member.member_id}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{member.phone || '—'}</p>
                        <p className="text-xs text-gray-500">{member.email || '—'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                          member.role === 'pastor' ? 'bg-[#BF0A30] text-white' :
                          member.role === 'leader' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>{member.role}</span>
                      </td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">{member.status}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/members/${member.id}`} className="p-1.5 text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/admin/members/${member.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length === 0 && <div className="p-12 text-center text-gray-500">No members found</div>}
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">Showing {members.length} of {totalCount} members</p>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
