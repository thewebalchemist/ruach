import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, MapPin, Calendar, Users, Phone, Plus, UserMinus, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

interface CrosspointRow {
  id: string;
  name: string;
  location: string;
  area: string;
  status: string;
  member_count: number;
  max_members: number;
  meeting_day: string;
  meeting_time: string;
  venue: string;
  leader_id: string | null;
  assistant_id: string | null;
  treasurer_id: string | null;
}

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

interface MembershipRow {
  id: string;
  user_id: string;
  role: string;
  profiles: ProfileRow;
}

export default function CrosspointDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [crosspoint, setCrosspoint] = useState<CrosspointRow | null>(null);
  const [leader, setLeader] = useState<ProfileRow | null>(null);
  const [assistant, setAssistant] = useState<ProfileRow | null>(null);
  const [treasurer, setTreasurer] = useState<ProfileRow | null>(null);
  const [members, setMembers] = useState<MembershipRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    if (id) loadData();
  }, [authLoading, profile, id]);

  async function loadData() {
    setLoading(true);

    const { data: cpData } = await db
      .from('crosspoints')
      .select('*')
      .eq('id', id)
      .single();

    if (!cpData) { setLoading(false); return; }
    const cp = cpData as CrosspointRow;
    setCrosspoint(cp);

    // Fetch leadership profiles
    const leaderIds = [cp.leader_id, cp.assistant_id, cp.treasurer_id].filter(Boolean) as string[];
    if (leaderIds.length > 0) {
      const { data: profiles } = await db
        .from('profiles')
        .select('id, first_name, last_name, phone')
        .in('id', leaderIds);

      const map: Record<string, ProfileRow> = {};
      for (const p of (profiles ?? []) as ProfileRow[]) map[p.id] = p;

      if (cp.leader_id) setLeader(map[cp.leader_id] ?? null);
      if (cp.assistant_id) setAssistant(map[cp.assistant_id] ?? null);
      if (cp.treasurer_id) setTreasurer(map[cp.treasurer_id] ?? null);
    }

    // Fetch members via crosspoint_memberships join
    const { data: memberData } = await db
      .from('crosspoint_memberships')
      .select('id, user_id, role, profiles(id, first_name, last_name, phone)')
      .eq('crosspoint_id', id);

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

  if (!crosspoint) {
    return (
      <AdminLayout title="Crosspoint Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Crosspoint not found</p>
          <Link href="/admin/crosspoints" className="text-[#BF0A30] hover:underline mt-4 inline-block">Back to Crosspoints</Link>
        </div>
      </AdminLayout>
    );
  }

  const capacityPct = crosspoint.max_members > 0
    ? (crosspoint.member_count / crosspoint.max_members) * 100
    : 0;

  return (
    <AdminLayout title={crosspoint.name}>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/crosspoints" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Crosspoints
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{crosspoint.name}</h1>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${crosspoint.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{crosspoint.status}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{crosspoint.location}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{crosspoint.meeting_day}s at {crosspoint.meeting_time}</span>
            </div>
          </div>
          <Link href={`/admin/crosspoints/${id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">
            <Edit className="w-4 h-4" />Edit
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Capacity */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Capacity</h2>
              <span className="text-2xl font-bold text-white">{crosspoint.member_count}/{crosspoint.max_members}</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${capacityPct}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{crosspoint.max_members - crosspoint.member_count} slots available</p>
          </div>

          {/* Members List */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Members ({members.length})</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                <Plus className="w-4 h-4" />Add Member
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
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        member.role === 'leader' ? 'bg-amber-100 text-amber-800' :
                        member.role === 'assistant' ? 'bg-blue-100 text-blue-800' :
                        member.role === 'treasurer' ? 'bg-green-100 text-green-800' :
                        'bg-white/5 text-gray-700'
                      }`}>{member.role}</span>
                      <button className="p-1.5 text-gray-400 hover:text-red-500"><UserMinus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No members assigned yet</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leadership */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Leadership</h2>
            <div className="space-y-4">
              {leader && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Leader</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                      {leader.first_name[0]}{leader.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">{leader.first_name} {leader.last_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{leader.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              {assistant && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Assistant</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {assistant.first_name[0]}{assistant.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">{assistant.first_name} {assistant.last_name}</p>
                      <p className="text-sm text-gray-500">{assistant.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              {treasurer && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Treasurer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                      {treasurer.first_name[0]}{treasurer.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">{treasurer.first_name} {treasurer.last_name}</p>
                      <p className="text-sm text-gray-500">{treasurer.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Details */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Meeting Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Day</span>
                <span className="font-medium">{crosspoint.meeting_day}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{crosspoint.meeting_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue</span>
                <span className="font-medium">{crosspoint.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Area</span>
                <span className="font-medium">{crosspoint.area}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-white/10 rounded-lg hover:bg-white/[0.06]">Take Attendance</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-white/10 rounded-lg hover:bg-white/[0.06]">View Module</button>
              <button className="w-full px-4 py-2.5 text-sm font-medium text-left border border-white/10 rounded-lg hover:bg-white/[0.06]">Request Food Bank</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
