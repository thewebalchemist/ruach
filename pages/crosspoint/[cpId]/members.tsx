import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, UserPlus, Phone, Mail, UserMinus, Loader2, X } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { useCrosspoint } from '@/hooks/useCrosspoint';
import { supabase } from '@/lib/supabase';

interface Member {
  user_id: string; role: string;
  profiles: { first_name: string; last_name: string; phone: string | null; email: string } | null;
}
interface SearchResult { id: string; first_name: string; last_name: string; email: string }

export default function CrosspointMembersPage() {
  const router = useRouter();
  const { cpId } = router.query as { cpId?: string };
  const { crosspoint, loading: cpLoading, reload: reloadCrosspoint } = useCrosspoint(cpId);

  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState<SearchResult[]>([]);
  const [addRole, setAddRole] = useState('member');
  const [adding, setAdding] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!cpId) return;
    setLoading(true);
    const { data } = await supabase
      .from('crosspoint_memberships')
      .select('user_id, role, profiles(first_name, last_name, phone, email)')
      .eq('crosspoint_id', cpId)
      .eq('status', 'active');
    setMembers((data as any) ?? []);
    setLoading(false);
  }, [cpId]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const filtered = members.filter(m => {
    const name = `${m.profiles?.first_name ?? ''} ${m.profiles?.last_name ?? ''} ${m.profiles?.phone ?? ''}`;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  async function searchProfiles(q: string) {
    setAddQuery(q);
    if (q.trim().length < 2) { setAddResults([]); return; }
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(8);
    setAddResults(data ?? []);
  }

  async function addMember(userId: string) {
    if (!cpId) return;
    setAdding(true);
    const { error } = await supabase.from('crosspoint_memberships').upsert({
      user_id: userId, crosspoint_id: cpId, role: addRole, status: 'active',
    }, { onConflict: 'user_id,crosspoint_id' });
    setAdding(false);
    if (!error) {
      setShowAdd(false); setAddQuery(''); setAddResults([]); setAddRole('member');
      loadMembers();
      reloadCrosspoint();
    }
  }

  async function removeMember(userId: string) {
    if (!cpId || !confirm('Remove this member from the crosspoint?')) return;
    await supabase.from('crosspoint_memberships').update({ status: 'inactive' }).eq('user_id', userId).eq('crosspoint_id', cpId);
    loadMembers();
    reloadCrosspoint();
  }

  if (cpLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Members">
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
                <option value="treasurer">Treasurer</option>
                <option value="leader">Leader</option>
              </select>
            </div>
            {addResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {addResults.map(r => (
                  <button key={r.id} onClick={() => addMember(r.id)} disabled={adding}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex justify-between text-sm disabled:opacity-50">
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Crosspoint Members</h1>
          <p className="text-gray-500">{members.length} members in {crosspoint.name}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <UserPlus className="w-4 h-4" />Add Member
        </button>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Capacity</span>
          <span className="font-medium">{crosspoint.memberCount} / {crosspoint.maxMembers}</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${crosspoint.maxMembers > 0 && (crosspoint.memberCount / crosspoint.maxMembers) >= 0.9 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${crosspoint.maxMembers > 0 ? Math.min((crosspoint.memberCount / crosspoint.maxMembers) * 100, 100) : 0}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">{Math.max(0, crosspoint.maxMembers - crosspoint.memberCount)} slots available</p>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {filtered.map(member => {
            const first = member.profiles?.first_name ?? '';
            const last  = member.profiles?.last_name ?? '';
            return (
              <div key={member.user_id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold">
                    {first[0]}{last[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{first} {last}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      {member.profiles?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.profiles.phone}</span>}
                      {member.profiles?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.profiles.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                    member.role === 'leader' ? 'bg-amber-100 text-amber-800' :
                    member.role === 'assistant' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'treasurer' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>{member.role}</span>
                  <button onClick={() => removeMember(member.user_id)} className="p-1.5 text-gray-400 hover:text-red-500" title="Remove from crosspoint">
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </div>
    </CrosspointLayout>
  );
}
