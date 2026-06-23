import { useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Calendar, ChevronRight } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { mockDiscipleshipCohorts, mockDiscipleshipCourses } from '@/data/discipleship';
import { mockMembers } from '@/data';

const MOCK_DATA = true;

type CohortStatus = 'active' | 'registration-open' | 'completed' | 'cancelled';

const statusConfig: Record<CohortStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  'registration-open': { label: 'Registration Open', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-white/5 text-gray-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function DiscipleshipCohortsPage() {
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<CohortStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);

  const filtered = mockDiscipleshipCohorts.filter(c => {
    const matchesLevel = filterLevel === 'all' || c.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesLevel && matchesStatus;
  });

  const stats = {
    total: mockDiscipleshipCohorts.length,
    active: mockDiscipleshipCohorts.filter(c => c.status === 'active').length,
    open: mockDiscipleshipCohorts.filter(c => c.status === 'registration-open').length,
    enrolled: mockDiscipleshipCohorts.reduce((s, c) => s + c.enrolledCount, 0),
  };

  return (
    <DiscipleshipLayout title="Cohorts">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Discipleship Cohorts</h1>
          <p className="text-gray-500">{stats.total} cohorts across all levels</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
        >
          <Plus className="w-4 h-4" />New Cohort
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Total Cohorts</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-gray-500">Open Registration</p>
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <p className="text-sm text-gray-500">Total Enrolled</p>
          <p className="text-2xl font-bold text-white">{stats.enrolled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 1, 2, 3] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setFilterLevel(l)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filterLevel === l
                      ? 'bg-[#BF0A30] text-white'
                      : 'border border-white/10 dark:border-[#2D2D2D] text-white/70 hover:bg-white/[0.06]'
                  }`}
                >
                  {l === 'all' ? 'All Levels' : `Level ${l}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              className="px-4 py-2 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as CohortStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="registration-open">Registration Open</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohorts List */}
      <div className="space-y-4">
        {filtered.map(cohort => {
          const course = mockDiscipleshipCourses.find(c => c.id === cohort.courseId);
          const teacher = mockMembers.find(m => m.id === cohort.teacherId);
          const cfg = statusConfig[cohort.status as CohortStatus] || statusConfig.active;
          const capacity = Math.round((cohort.enrolledCount / cohort.maxCapacity) * 100);

          return (
            <div key={cohort.id} className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5 hover:border-[#BF0A30]/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#BF0A30] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    L{cohort.level}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{cohort.name}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{course?.title}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(cohort.startDate).toLocaleDateString()} - {new Date(cohort.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {cohort.enrolledCount}/{cohort.maxCapacity} students
                      </span>
                      {teacher && <span>Teacher: {teacher.firstName} {teacher.lastName}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{cohort.schedule}</p>

                    {/* Capacity Bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${capacity >= 90 ? 'bg-red-500' : capacity >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(capacity, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{capacity}% full</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/discipleship/cohorts/${cohort.id}`}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-white/10 dark:border-[#2D2D2D] rounded-lg text-white/70 hover:bg-white/[0.06] flex-shrink-0"
                >
                  View<ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-12 text-center text-gray-500">
            No cohorts found
          </div>
        )}
      </div>

      {/* New Cohort Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12151C] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white mb-5">New Cohort</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Cohort Name</label>
                <input type="text" placeholder="e.g. KDC Level 1 - Q2 2026" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Level</label>
                <select className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white">
                  {mockDiscipleshipCourses.map(c => (
                    <option key={c.id} value={c.id}>Level {c.level} - {c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Start Date</label>
                  <input type="date" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">End Date</label>
                  <input type="date" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Schedule</label>
                <input type="text" placeholder="e.g. Saturdays 2:00 PM - 4:00 PM" className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Max Capacity</label>
                <input type="number" defaultValue={30} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-white/10 dark:border-[#2D2D2D] rounded-lg text-white/70 hover:bg-white/[0.06]">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]">Create Cohort</button>
            </div>
          </div>
        </div>
      )}
    </DiscipleshipLayout>
  );
}
