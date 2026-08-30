import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Phone, Mail, UserPlus, UserMinus, X, Loader2 } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { useDepartment } from '@/hooks/useDepartment';
import { supabase } from '@/lib/supabase';

interface Member {
  user_id: string; role: string; joined_date: string;
  profiles: { first_name: string; last_name: string; phone: string | null; email: string; member_id: string | null } | null;
}
interface SearchResult { id: string; first_name: string; last_name: string; email: string }

export default function DepartmentMembersPage() {
  const router = useRouter();
  const { deptId } = router.query as { deptId?: string };
  const { department, loading: deptLoading } = useDepartment(deptId);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState<SearchResult[]>([]);
  const [addRole, setAddRole] = useState('member');
  const [adding, setAdding] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!deptId) return;
    setLoading(true);
    const { data } = await supabase.from('department_memberships').select('user_id, role, joined_date, profiles(first_name, last_name, phone, email, member_id)').eq('department_id', deptId).eq('status', 'active');
    setMembers((data as any) ?? []);
    setLoading(false);
  }, [deptId]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const filtered = members.filter(m => {
    const name = `${m.profiles?.first_name ?? ''} ${m.profiles?.last_name ?? ''} ${m.profiles?.phone ?? ''}`;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const leaders = members.filter(m => m.role === 'leader').length;

  async function searchProfiles(q: string) {
    setAddQuery(q);
    if (q.trim().length < 2) { setAddResults([]); return; }
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, email').or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`).limit(8);
    setAddResults(data ?? []);
  }

  async function addMember(userId: string) {
    if (!deptId) return;
    setAdding(true);
    await supabase.from('department_memberships').upsert({ user_id: userId, department_id: deptId, role: addRole, status: 'active' }, { onConflict: 'user_id,department_id' });
    setAdding(false);
    setShowAdd(false);
    setAddQuery('');
    setAddResults([]);
    setAddRole('member');
    loadMembers();
  }

  async function removeMember(userId: string) {
    if (!deptId || !confirm('Remove this member from the department?')) return;
    await supabase.from('department_memberships').update({ status: 'inactive' }).eq('user_id', userId).eq('department_id', deptId);
    loadMembers();
  }

  if (deptLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  return (
    <DepartmentLayout department={department} title="Members">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Members</h1>
          <p className="text-gray-500">{members.length} members serving in {department.name}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]">
          <UserPlus className="w-4 h-4" />Add Member
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Leaders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaders}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search members..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="leader">Leaders</option>
            <option value="assistant">Assistants</option>
            <option value="member">Members</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
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
                <tr key={member.user_id} className="hover:bg-gray-50 dark:hover:bg-[#252525]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                        {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.profiles?.first_name} {member.profiles?.last_name}</p>
                        <p className="text-xs text-gray-500">{member.profiles?.member_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {member.profiles?.phone && <p className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Phone className="w-3 h-3" />{member.profiles.phone}</p>}
                      {member.profiles?.email && <p className="flex items-center gap-1 text-gray-500 text-xs mt-1"><Mail className="w-3 h-3" />{member.profiles.email}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${member.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>{member.role}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{member.joined_date ? new Date(member.joined_date).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => removeMember(member.user_id)} className="p-1.5 text-gray-400 hover:text-red-500" title="Remove"><UserMinus className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </div>
    </DepartmentLayout>
  );
}
