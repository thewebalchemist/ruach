import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { DepartmentIcon } from '@/components/shared/DepartmentIcon';
import { supabase } from '@/lib/supabase';

interface Department {
  id: string; name: string; description: string | null; icon: string | null;
  profiles: { first_name: string; last_name: string } | null;
}
interface SubTeam { id: string; department_id: string; name: string }

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [subTeamsByDept, setSubTeamsByDept] = useState<Record<string, SubTeam[]>>({});
  const [pendingByDept, setPendingByDept] = useState<Record<string, number>>({});
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [deptRes, membershipsRes, subTeamsRes, requestsRes] = await Promise.all([
      supabase.from('departments').select('id, name, description, icon, profiles!leader_id(first_name, last_name)').order('name'),
      supabase.from('department_memberships').select('department_id').eq('status', 'active'),
      supabase.from('department_sub_teams').select('id, department_id, name'),
      supabase.from('department_join_requests').select('department_id').eq('status', 'pending'),
    ]);
    setDepartments((deptRes.data as any) ?? []);

    const counts: Record<string, number> = {};
    (membershipsRes.data ?? []).forEach(m => { counts[m.department_id] = (counts[m.department_id] ?? 0) + 1; });
    setMemberCounts(counts);

    const subTeams: Record<string, SubTeam[]> = {};
    (subTeamsRes.data ?? []).forEach(st => { (subTeams[st.department_id] ??= []).push(st); });
    setSubTeamsByDept(subTeams);

    const pending: Record<string, number> = {};
    (requestsRes.data ?? []).forEach(r => { pending[r.department_id] = (pending[r.department_id] ?? 0) + 1; });
    setPendingByDept(pending);
    setPendingTotal(requestsRes.data?.length ?? 0);

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = departments.filter(d =>
    `${d.name} ${d.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalServing = Object.values(memberCounts).reduce((s, c) => s + c, 0);

  if (loading) {
    return <AdminLayout title="Departments"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Departments">
      <PageHeader title="Departments" subtitle={`${departments.length} departments serving the church`} />

      {pendingTotal > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">{pendingTotal} pending join requests</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">Members waiting to join departments</p>
              </div>
            </div>
            <Link href="/admin/departments/requests" className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700">Review Requests</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Departments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Serving</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalServing}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTotal}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search departments..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => {
          const subTeams = subTeamsByDept[dept.id] ?? [];
          const deptPending = pendingByDept[dept.id] ?? 0;

          return (
            <Link key={dept.id} href={`/admin/departments/${dept.id}`}>
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center text-[#BF0A30]">
                    <DepartmentIcon name={dept.icon} className="w-5 h-5" />
                  </div>
                  {deptPending > 0 && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">{deptPending} pending</span>}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dept.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{dept.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <Users className="w-4 h-4" />
                  <span>{memberCounts[dept.id] ?? 0} members</span>
                </div>

                {subTeams.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Sub-teams:</p>
                    <div className="flex flex-wrap gap-1">
                      {subTeams.slice(0, 3).map(team => (
                        <span key={team.id} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">{team.name}</span>
                      ))}
                      {subTeams.length > 3 && <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">+{subTeams.length - 3}</span>}
                    </div>
                  </div>
                )}

                {dept.profiles && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2D2D2D]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold">{dept.profiles.first_name[0]}{dept.profiles.last_name[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{dept.profiles.first_name} {dept.profiles.last_name}</p>
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
