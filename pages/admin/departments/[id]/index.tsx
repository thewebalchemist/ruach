import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, UserPlus, Mail, Phone, X, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { DepartmentIcon } from '@/components/shared/DepartmentIcon';
import { supabase } from '@/lib/supabase';

interface Department {
  id: string; name: string; description: string | null; icon: string | null; leader_id: string | null;
}
interface Leader { first_name: string; last_name: string; member_id: string | null; phone: string | null; email: string }
interface SubTeam { id: string; name: string; member_count: number }
interface Member { user_id: string; role: string; profiles: { first_name: string; last_name: string; phone: string | null } | null }
interface SearchResult { id: string; first_name: string; last_name: string; email: string }

export default function DepartmentDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [department, setDepartment] = useState<Department | null>(null);
  const [leader, setLeader] = useState<Leader | null>(null);
  const [subTeams, setSubTeams] = useState<SubTeam[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState<SearchResult[]>([]);
  const [addRole, setAddRole] = useState('member');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [deptRes, subTeamsRes, membersRes] = await Promise.all([
      supabase.from('departments').select('id, name, description, icon, leader_id').eq('id', id).single(),
      supabase.from('department_sub_teams').select('id, name').eq('department_id', id),
      supabase.from('department_memberships').select('user_id, role, profiles(first_name, last_name, phone)').eq('department_id', id).eq('status', 'active'),
    ]);
    setDepartment(deptRes.data ?? null);
    setSubTeams((subTeamsRes.data ?? []).map(st => ({ ...st, member_count: 0 })));
    setMembers((membersRes.data as any) ?? []);

    if (deptRes.data?.leader_id) {
      const { data } = await supabase.from('profiles').select('first_name, last_name, member_id, phone, email').eq('id', deptRes.data.leader_id).single();
      setLeader(data);
    } else {
      setLeader(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function searchProfiles(q: string) {
    setAddQuery(q);
    if (q.trim().length < 2) { setAddResults([]); return; }
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, email')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`).limit(8);
    setAddResults(data ?? []);
  }

  async function addMember(userId: string) {
    if (!id) return;
    setAdding(true);
    await supabase.from('department_memberships').upsert({
      user_id: userId, department_id: id, role: addRole, status: 'active',
    }, { onConflict: 'user_id,department_id' });
    setAdding(false);
    setShowAdd(false);
    setAddQuery('');
    setAddResults([]);
    setAddRole('member');
    load();
  }

  if (loading) {
    return <AdminLayout title="Department"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
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
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Add Member</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 mb-4">
              <input value={addQuery} onChange={e => searchProfiles(e.target.value)} placeholder="Search by name or email…" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" autoFocus />
              <select value={addRole} onChange={e => setAddRole(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white">
                <option value="member">Member</option>
                <option value="assistant">Assistant</option>
                <option value="leader">Leader</option>
              </select>
            </div>
            {addResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {addResults.map(r => (
                  <button key={r.id} onClick={() => addMember(r.id)} disabled={adding} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex justify-between text-sm disabled:opacity-50">
                    <span className="text-gray-800 dark:text-gray-200">{r.first_name} {r.last_name}</span>
                    <span className="text-gray-400">{r.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Departments
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center text-[#BF0A30]"><DepartmentIcon name={department.icon} className="w-7 h-7" /></div>
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
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
              <p className="text-sm text-gray-500">Sub-teams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{subTeams.length}</p>
            </div>
          </div>

          {subTeams.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Sub-teams</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {subTeams.map(team => (
                  <div key={team.id} className="p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white">{team.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Members ({members.length})</h2>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                <UserPlus className="w-4 h-4" />Add Member
              </button>
            </div>
            {members.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
                {members.map(member => (
                  <div key={member.user_id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                        {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                      </div>
                      <div>
                        <Link href={`/admin/members/${member.user_id}`} className="font-medium text-gray-900 dark:text-white hover:text-[#BF0A30]">
                          {member.profiles?.first_name} {member.profiles?.last_name}
                        </Link>
                        <p className="text-sm text-gray-500">{member.profiles?.phone}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${member.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>{member.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No members in this department</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Head of Department</h2>
            {leader ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">{leader.first_name[0]}{leader.last_name[0]}</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{leader.first_name} {leader.last_name}</p>
                    <p className="text-sm text-gray-500">{leader.member_id}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {leader.phone && <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Phone className="w-4 h-4" />{leader.phone}</p>}
                  {leader.email && <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Mail className="w-4 h-4" />{leader.email}</p>}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No HOD assigned</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
