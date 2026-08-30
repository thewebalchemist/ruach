import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Phone, Mail, MapPin, Calendar,
  Users, GraduationCap, Award, Clock, CheckCircle, Loader2,
} from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Member {
  id: string; first_name: string; last_name: string; member_id: string | null;
  phone: string | null; email: string; role: string; status: string;
  gender: string | null; date_of_birth: string | null; address: string | null;
  occupation: string | null; marital_status: string | null; branch: string; crosspoint_zone: string | null;
  member_since: string | null; connect_graduated_at: string | null; is_legacy_member: boolean;
  created_at: string; updated_at: string;
}
interface CrosspointInfo { name: string; area: string; meeting_day: string | null; meeting_time: string | null }
interface MembershipRow { role: string; crosspoints: CrosspointInfo | null }
interface DeptRow { role: string; joined_date: string; departments: { name: string; icon: string | null } | null }
interface DiscRow { level: number; status: string; enrolled_at: string; graduated_at: string | null; discipleship_courses: { title: string } | null }

export default function MemberDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [member, setMember] = useState<Member | null>(null);
  const [crosspoint, setCrosspoint] = useState<{ role: string; info: CrosspointInfo } | null>(null);
  const [departments, setDepartments] = useState<DeptRow[]>([]);
  const [discipleship, setDiscipleship] = useState<DiscRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [memberRes, cpRes, deptRes, discRes] = await Promise.all([
      supabase.from('profiles').select('id, first_name, last_name, member_id, phone, email, role, status, gender, date_of_birth, address, occupation, marital_status, branch, crosspoint_zone, member_since, connect_graduated_at, is_legacy_member, created_at, updated_at').eq('id', id).single(),
      supabase.from('crosspoint_memberships').select('role, crosspoints(name, area, meeting_day, meeting_time)').eq('user_id', id).eq('status', 'active').maybeSingle(),
      supabase.from('department_memberships').select('role, joined_date, departments(name, icon)').eq('user_id', id).eq('status', 'active'),
      supabase.from('discipleship_students').select('level, status, enrolled_at, graduated_at, discipleship_courses(title)').eq('user_id', id).order('level'),
    ]);
    setMember(memberRes.data ?? null);
    setCrosspoint((cpRes.data as any)?.crosspoints ? { role: (cpRes.data as any).role, info: (cpRes.data as any).crosspoints } : null);
    setDepartments((deptRes.data as any) ?? []);
    setDiscipleship((discRes.data as any) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <AdminLayout title="Member"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  if (!member) {
    return (
      <AdminLayout title="Member Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Member not found</p>
          <Link href="/admin/members" className="text-[#BF0A30] hover:underline mt-4 inline-block">Back to Members</Link>
        </div>
      </AdminLayout>
    );
  }

  const currentDisc = discipleship.find(d => !['completed', 'dropped', 'failed'].includes(d.status));
  const completedLevels = discipleship.filter(d => d.status === 'completed');

  return (
    <AdminLayout title={`${member.first_name} ${member.last_name}`}>
      <div className="mb-6">
        <Link href="/admin/members" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Members
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xl font-bold">
              {member.first_name[0]}{member.last_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{member.first_name} {member.last_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-sm text-gray-500">{member.member_id}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                  member.role === 'pastor' ? 'bg-[#BF0A30] text-white' :
                  member.role === 'leader' ? 'bg-blue-100 text-blue-800' :
                  'bg-white/5 text-gray-700'
                }`}>{member.role}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">{member.status}</span>
              </div>
            </div>
          </div>
          <Link href={`/admin/members/${id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">
            <Edit className="w-4 h-4" />Edit Member
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center"><Phone className="w-5 h-5 text-gray-500" /></div>
                <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium text-gray-900 dark:text-white">{member.phone}</p></div>
              </div>
              {member.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center"><Mail className="w-5 h-5 text-gray-500" /></div>
                  <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-900 dark:text-white">{member.email}</p></div>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center"><MapPin className="w-5 h-5 text-gray-500" /></div>
                  <div><p className="text-sm text-gray-500">Address</p><p className="font-medium text-gray-900 dark:text-white">{member.address}</p></div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center"><Calendar className="w-5 h-5 text-gray-500" /></div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900 dark:text-white">{member.member_since ? new Date(member.member_since).toLocaleDateString() : new Date(member.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {member.gender && <div><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize ml-1">{member.gender}</span></div>}
              {member.date_of_birth && <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium ml-1">{member.date_of_birth}</span></div>}
              {member.occupation && <div><span className="text-gray-500">Occupation:</span> <span className="font-medium ml-1">{member.occupation}</span></div>}
              {member.marital_status && <div><span className="text-gray-500">Marital Status:</span> <span className="font-medium capitalize ml-1">{member.marital_status}</span></div>}
              <div><span className="text-gray-500">Branch:</span> <span className="font-medium ml-1">{member.branch}</span></div>
              {member.crosspoint_zone && <div><span className="text-gray-500">Zone:</span> <span className="font-medium capitalize ml-1">{member.crosspoint_zone}</span></div>}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Departments</h2>
            {departments.length > 0 ? (
              <div className="space-y-3">
                {departments.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{d.departments?.name}</p>
                        <p className="text-sm text-gray-500">Joined {new Date(d.joined_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${d.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>{d.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not serving in any department</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5" />Crosspoint</h2>
            {crosspoint ? (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{crosspoint.info.name}</p>
                <p className="text-sm text-gray-500">{crosspoint.info.area}</p>
                {crosspoint.info.meeting_day && crosspoint.info.meeting_time && <p className="text-sm text-gray-500 mt-1">{crosspoint.info.meeting_day}s at {crosspoint.info.meeting_time}</p>}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2D2D2D]">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${crosspoint.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>{crosspoint.role}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not assigned to a crosspoint</p>
            )}
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5" />Connect Class</h2>
            {member.connect_graduated_at ? (
              <div>
                <div className="flex items-center gap-2 text-green-600 mb-2"><CheckCircle className="w-5 h-5" /><span className="font-medium">Graduated</span></div>
                <p className="text-sm text-gray-500">Completed {new Date(member.connect_graduated_at).toLocaleDateString()}</p>
                {member.is_legacy_member && <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Legacy Member</span>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not yet completed</p>
            )}
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5" />Discipleship</h2>
            {discipleship.length > 0 ? (
              <div className="space-y-3">
                {currentDisc && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Currently: Level {currentDisc.level}</p>
                    {currentDisc.discipleship_courses && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{currentDisc.discipleship_courses.title}</p>}
                    <p className="text-xs text-gray-500 mt-1">Since {new Date(currentDisc.enrolled_at).toLocaleDateString()}</p>
                  </div>
                )}
                {completedLevels.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Completed Levels</p>
                    <div className="space-y-1">
                      {completedLevels.map((cl) => (
                        <div key={cl.level} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /><span>Level {cl.level}</span></div>
                          <span className="text-xs text-gray-400">{cl.graduated_at ? new Date(cl.graduated_at).toLocaleDateString() : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not enrolled in discipleship</p>
            )}
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5" />Activity</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Last updated</span><span className="font-medium">{new Date(member.updated_at).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Account created</span><span className="font-medium">{new Date(member.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
