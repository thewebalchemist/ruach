import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Users, BookOpen, CheckCircle, Clock, AlertCircle, UserCheck, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

export default function AdminConnectPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingLegacy, setPendingLegacy] = useState<any[]>([]);
  const [readyToGraduateCount, setReadyToGraduateCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/connect'); return; }
    if (!['admin', 'pastor'].includes(profile.role)) {
      router.push('/connect');
      return;
    }
    load();
  }, [authLoading, profile]);

  async function load() {
    setLoading(true);
    const [
      { data: cohortData },
      { count: studentCount },
      { data: legacyData },
      { count: graduateCount },
    ] = await Promise.all([
      db.from('connect_cohorts')
        .select('*, profiles!connect_cohorts_teacher_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false }),
      supabase.from('connect_students')
        .select('id', { count: 'exact', head: true })
        .in('status', ['enrolled', 'in-progress']),
      db.from('legacy_member_requests')
        .select('*')
        .eq('status', 'pending'),
      supabase.from('connect_students')
        .select('id', { count: 'exact', head: true })
        .eq('can_graduate', true)
        .neq('status', 'completed'),
    ]);

    setCohorts(cohortData ?? []);
    setTotalStudents(studentCount ?? 0);
    setPendingLegacy(legacyData ?? []);
    setReadyToGraduateCount(graduateCount ?? 0);
    setLoading(false);
  }

  if (loading) return (
    <AdminLayout title="Connect Class">
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
      </div>
    </AdminLayout>
  );

  const activeCohorts = cohorts.filter(c => c.status === 'active');
  const openCohorts = cohorts.filter(c => c.status === 'registration-open');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'registration-open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-white/5 text-white/70 dark:bg-gray-800';
      case 'draft': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-white/5 text-gray-700';
    }
  };

  return (
    <AdminLayout title="Connect Class">
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Connect Class"
          subtitle="Manage cohorts, students, and legacy verifications"
        />
        <Link
          href="/admin/connect/cohorts/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white font-medium rounded-lg hover:bg-[#B00325] text-sm"
        >
          <Plus className="w-4 h-4" />New Cohort
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Active Cohorts</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeCohorts.length}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalStudents}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Legacy Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">{pendingLegacy.length}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#BF0A30]" />
            </div>
            <span className="text-sm text-gray-500">Ready to Graduate</span>
          </div>
          <p className="text-2xl font-bold text-white">{readyToGraduateCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* All Cohorts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">All Cohorts</h2>
            <Link href="/admin/connect/cohorts" className="text-sm text-[#BF0A30] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {cohorts.slice(0, 5).map((cohort) => {
              return (
                <Link
                  key={cohort.id}
                  href={`/admin/connect/cohorts/${cohort.id}`}
                  className="block bg-[#12151C] rounded-xl border border-white/[0.06] p-4 hover:border-[#BF0A30]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{cohort.name}</p>
                      <p className="text-sm text-gray-500">
                        {cohort.profiles?.first_name} {cohort.profiles?.last_name} • {cohort.enrolled_count ?? 0}/{cohort.max_capacity} students
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(cohort.status)}`}>
                      {cohort.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(cohort.start_date).toLocaleDateString()} – {new Date(cohort.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column: quick actions + pending legacy */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/connect/cohorts/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.06] text-sm font-medium text-white/70">
                <Plus className="w-4 h-4 text-[#BF0A30]" />Create New Cohort
              </Link>
              <Link href="/admin/connect/legacy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.06] text-sm font-medium text-white/70">
                <UserCheck className="w-4 h-4 text-[#BF0A30]" />
                Verify Legacy Members
                {pendingLegacy.length > 0 && (
                  <span className="ml-auto bg-[#BF0A30] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {pendingLegacy.length}
                  </span>
                )}
              </Link>
              <Link href="/admin/connect/graduates" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.06] text-sm font-medium text-white/70">
                <CheckCircle className="w-4 h-4 text-[#BF0A30]" />Graduate Students
                {readyToGraduateCount > 0 && (
                  <span className="ml-auto bg-[#BF0A30] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {readyToGraduateCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Pending Legacy */}
          {pendingLegacy.length > 0 && (
            <div className="bg-[#12151C] rounded-xl border border-amber-200 dark:border-amber-900/50 p-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Legacy Requests
              </h3>
              <div className="space-y-2">
                {pendingLegacy.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-white">{req.full_name}</p>
                      <p className="text-xs text-gray-500">Joined {req.year_joined}</p>
                    </div>
                    <Link
                      href={`/admin/connect/legacy/${req.id}`}
                      className="text-xs text-[#BF0A30] hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                ))}
                {pendingLegacy.length > 3 && (
                  <Link href="/admin/connect/legacy" className="text-xs text-[#BF0A30] hover:underline">
                    +{pendingLegacy.length - 3} more
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
