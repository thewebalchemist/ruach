import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, Users, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface DepartmentRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  member_count: number;
  leader_id: string | null;
  sub_teams: { id: string; name: string }[] | null;
}

interface LeaderRow {
  id: string;
  first_name: string;
  last_name: string;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [leaders, setLeaders] = useState<Record<string, LeaderRow>>({});
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingByDept, setPendingByDept] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setLoading(true);

    // Fetch departments
    const { data: deptData } = await db
      .from('departments')
      .select('*')
      .order('name');

    const depts = (deptData ?? []) as DepartmentRow[];
    setDepartments(depts);

    // Fetch leader profiles
    const leaderIds = [...new Set(depts.map(d => d.leader_id).filter(Boolean))] as string[];
    if (leaderIds.length > 0) {
      const { data: profileData } = await db
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', leaderIds);

      const map: Record<string, LeaderRow> = {};
      for (const p of (profileData ?? []) as LeaderRow[]) {
        map[p.id] = p;
      }
      setLeaders(map);
    }

    // Fetch pending join requests count
    const { data: pendingData } = await db
      .from('department_join_requests')
      .select('id, department_id')
      .eq('status', 'pending');

    const pendingRows = (pendingData ?? []) as { id: string; department_id: string }[];
    setPendingCount(pendingRows.length);

    const byDept: Record<string, number> = {};
    for (const row of pendingRows) {
      byDept[row.department_id] = (byDept[row.department_id] || 0) + 1;
    }
    setPendingByDept(byDept);

    setLoading(false);
  }

  const filtered = departments.filter(d =>
    `${d.name} ${d.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalServing = departments.reduce((s, d) => s + (d.member_count || 0), 0);

  return (
    <AdminLayout title="Departments">
      <PageHeader title="Departments" subtitle={`${departments.length} departments serving the church`} />

      {/* Pending Requests Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">{pendingCount} pending join requests</p>
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
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Serving</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalServing}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search departments..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A]" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      ) : (
        /* Departments Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => {
            const leader = dept.leader_id ? leaders[dept.leader_id] : null;
            const deptRequests = pendingByDept[dept.id] || 0;
            const subTeams = dept.sub_teams ?? [];

            return (
              <Link key={dept.id} href={`/admin/departments/${dept.id}`}>
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 h-full hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{dept.icon}</div>
                    {deptRequests > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">{deptRequests} pending</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dept.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{dept.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <Users className="w-4 h-4" />
                    <span>{dept.member_count || 0} members</span>
                  </div>

                  {subTeams.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Sub-teams:</p>
                      <div className="flex flex-wrap gap-1">
                        {subTeams.slice(0, 3).map((team: { id: string; name: string }) => (
                          <span key={team.id} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">{team.name}</span>
                        ))}
                        {subTeams.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">+{subTeams.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {leader && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2D2D2D]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xs font-semibold">{leader.first_name[0]}{leader.last_name[0]}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{leader.first_name} {leader.last_name}</p>
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
      )}
    </AdminLayout>
  );
}
