import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, MapPin, Calendar, Phone, UserMinus, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface CrosspointDetail {
  id: string; name: string; area: string; location: string; status: string;
  member_count: number; max_members: number; meeting_day: string | null; meeting_time: string | null; venue: string | null;
  leader: { id: string; first_name: string; last_name: string; phone: string | null } | null;
  assistant: { id: string; first_name: string; last_name: string; phone: string | null } | null;
  treasurer: { id: string; first_name: string; last_name: string; phone: string | null } | null;
}
interface MemberRow { user_id: string; role: string; profiles: { first_name: string; last_name: string; phone: string | null } | null }

export default function CrosspointDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [crosspoint, setCrosspoint] = useState<CrosspointDetail | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [cpRes, membersRes] = await Promise.all([
      supabase.from('crosspoints')
        .select('id, name, area, location, status, member_count, max_members, meeting_day, meeting_time, venue, leader:profiles!leader_id(id, first_name, last_name, phone), assistant:profiles!assistant_id(id, first_name, last_name, phone), treasurer:profiles!treasurer_id(id, first_name, last_name, phone)')
        .eq('id', id).single(),
      supabase.from('crosspoint_memberships').select('user_id, role, profiles(first_name, last_name, phone)').eq('crosspoint_id', id).eq('status', 'active'),
    ]);
    setCrosspoint((cpRes.data as any) ?? null);
    setMembers((membersRes.data as any) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function removeMember(userId: string) {
    if (!id || !confirm('Remove this member from the crosspoint?')) return;
    await supabase.from('crosspoint_memberships').update({ status: 'inactive' }).eq('user_id', userId).eq('crosspoint_id', id);
    load();
  }

  if (loading) {
    return <AdminLayout title="Crosspoint"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
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

  const capacityPct = crosspoint.max_members > 0 ? (crosspoint.member_count / crosspoint.max_members) * 100 : 0;

  return (
    <AdminLayout title={crosspoint.name}>
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
              {crosspoint.meeting_day && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{crosspoint.meeting_day}s at {crosspoint.meeting_time}</span>}
            </div>
          </div>
          <Link href={`/admin/crosspoints/${id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">
            <Edit className="w-4 h-4" />Edit
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Capacity</h2>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{crosspoint.member_count}/{crosspoint.max_members}</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(capacityPct, 100)}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{Math.max(0, crosspoint.max_members - crosspoint.member_count)} slots available</p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Members ({members.length})</h2>
              <Link href={`/crosspoint/${id}/members`} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                Manage Members
              </Link>
            </div>
            {members.length > 0 ? (
              <div className="divide-y divide-white/[0.06]">
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
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        member.role === 'leader' ? 'bg-amber-100 text-amber-800' :
                        member.role === 'assistant' ? 'bg-blue-100 text-blue-800' :
                        member.role === 'treasurer' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>{member.role}</span>
                      <button onClick={() => removeMember(member.user_id)} className="p-1.5 text-gray-400 hover:text-red-500"><UserMinus className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No members assigned yet</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Leadership</h2>
            <div className="space-y-4">
              {crosspoint.leader && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Leader</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                      {crosspoint.leader.first_name[0]}{crosspoint.leader.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{crosspoint.leader.first_name} {crosspoint.leader.last_name}</p>
                      {crosspoint.leader.phone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{crosspoint.leader.phone}</p>}
                    </div>
                  </div>
                </div>
              )}
              {crosspoint.assistant && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Assistant</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {crosspoint.assistant.first_name[0]}{crosspoint.assistant.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{crosspoint.assistant.first_name} {crosspoint.assistant.last_name}</p>
                      <p className="text-sm text-gray-500">{crosspoint.assistant.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              {crosspoint.treasurer && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Treasurer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                      {crosspoint.treasurer.first_name[0]}{crosspoint.treasurer.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{crosspoint.treasurer.first_name} {crosspoint.treasurer.last_name}</p>
                      <p className="text-sm text-gray-500">{crosspoint.treasurer.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              {!crosspoint.leader && !crosspoint.assistant && !crosspoint.treasurer && (
                <p className="text-sm text-gray-500">No leadership assigned yet</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Meeting Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Day</span><span className="font-medium">{crosspoint.meeting_day ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{crosspoint.meeting_time ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium">{crosspoint.venue ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Area</span><span className="font-medium">{crosspoint.area}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link href={`/crosspoint/${id}/attendance`} className="block w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Take Attendance</Link>
              <Link href={`/crosspoint/${id}/module`} className="block w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">View Module</Link>
              <Link href={`/crosspoint/${id}/food-bank`} className="block w-full px-4 py-2.5 text-sm font-medium text-left border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]">Food Bank Requests</Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
