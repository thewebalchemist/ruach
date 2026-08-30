import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Users, BookOpen, CheckCircle, Clock, AlertCircle, UserCheck, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Cohort {
  id: string; name: string; status: string; max_capacity: number; enrolled_count: number;
  start_date: string; end_date: string; profiles: { first_name: string; last_name: string } | null;
}
interface LegacyRequest { id: string; full_name: string; year_joined: number }

export default function AdminConnectPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [readyToGraduateCount, setReadyToGraduateCount] = useState(0);
  const [pendingLegacy, setPendingLegacy] = useState<LegacyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [cohortsRes, studentsCountRes, readyRes, legacyRes] = await Promise.all([
      supabase.from('connect_cohorts').select('id, name, status, max_capacity, enrolled_count, start_date, end_date, profiles!teacher_id(first_name, last_name)').order('start_date', { ascending: false }),
      supabase.from('connect_students').select('id', { count: 'exact', head: true }).in('status', ['enrolled', 'in-progress']),
      supabase.from('connect_students').select('id', { count: 'exact', head: true }).eq('can_graduate', true).is('graduated_at', null),
      supabase.from('legacy_member_requests').select('id, full_name, year_joined').eq('status', 'pending'),
    ]);
    setCohorts((cohortsRes.data as any) ?? []);
    setStudentCount(studentsCountRes.count ?? 0);
    setReadyToGraduateCount(readyRes.count ?? 0);
    setPendingLegacy(legacyRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeCohorts = cohorts.filter(c => c.status === 'active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'registration-open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-white/5 text-white/70 dark:bg-gray-800';
      case 'draft': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-white/5 text-gray-700';
    }
  };

  if (loading) {
    return <AdminLayout title="Connect Class"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Connect Class">
      <div className="flex items-start justify-between mb-6">
        <PageHeader title="Connect Class" subtitle="Manage cohorts, students, and legacy verifications" />
        <Link href="/connect/cohorts/new" className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white font-medium rounded-lg hover:bg-[#B00325] text-sm">
          <Plus className="w-4 h-4" />New Cohort
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><BookOpen className="w-5 h-5 text-green-600" /></div>
            <span className="text-sm text-gray-500">Active Cohorts</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeCohorts.length}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <span className="text-sm text-gray-500">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentCount}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
            <span className="text-sm text-gray-500">Legacy Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">{pendingLegacy.length}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-[#BF0A30]" /></div>
            <span className="text-sm text-gray-500">Ready to Graduate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{readyToGraduateCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Cohorts</h2>
            <Link href="/connect/cohorts" className="text-sm text-[#BF0A30] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {cohorts.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-8 text-center text-gray-500">No cohorts yet</div>
            ) : cohorts.slice(0, 5).map((cohort) => (
              <Link key={cohort.id} href={`/admin/connect/cohorts/${cohort.id}`} className="block bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 hover:border-[#BF0A30]/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{cohort.name}</p>
                    <p className="text-sm text-gray-500">{cohort.profiles?.first_name} {cohort.profiles?.last_name} • {cohort.enrolled_count ?? 0}/{cohort.max_capacity} students</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(cohort.status)}`}>{cohort.status.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(cohort.start_date).toLocaleDateString()} – {new Date(cohort.end_date).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/connect/cohorts/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300">
                <Plus className="w-4 h-4 text-[#BF0A30]" />Create New Cohort
              </Link>
              <Link href="/connect/legacy-requests" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300">
                <UserCheck className="w-4 h-4 text-[#BF0A30]" />
                Verify Legacy Members
                {pendingLegacy.length > 0 && <span className="ml-auto bg-[#BF0A30] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingLegacy.length}</span>}
              </Link>
              <Link href="/connect/graduates" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm font-medium text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-[#BF0A30]" />Graduate Students
                {readyToGraduateCount > 0 && <span className="ml-auto bg-[#BF0A30] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{readyToGraduateCount}</span>}
              </Link>
            </div>
          </div>

          {pendingLegacy.length > 0 && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-amber-200 dark:border-amber-900/50 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" />Legacy Requests</h3>
              <div className="space-y-2">
                {pendingLegacy.map((req) => (
                  <div key={req.id} className="flex items-center justify-between text-sm">
                    <div><p className="font-medium text-gray-900 dark:text-white">{req.full_name}</p><p className="text-xs text-gray-500">Joined {req.year_joined}</p></div>
                    <Link href="/connect/legacy-requests" className="text-xs text-[#BF0A30] hover:underline">Review</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
