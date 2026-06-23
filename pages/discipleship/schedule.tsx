import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Users } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { mockDiscipleshipSessions, mockDiscipleshipCohorts, mockDiscipleshipCourses } from '@/data/discipleship';

const MOCK_DATA = true;

export default function DiscipleshipSchedulePage() {
  const [filterCohort, setFilterCohort] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Group sessions by cohort
  const sessions = showCompleted
    ? mockDiscipleshipSessions
    : mockDiscipleshipSessions.filter(s => !s.isCompleted);

  const filteredSessions = filterCohort === 'all'
    ? sessions
    : sessions.filter(s => s.cohortId === filterCohort);

  // Group by cohort
  const grouped = filteredSessions.reduce<Record<string, typeof filteredSessions>>((acc, session) => {
    if (!acc[session.cohortId]) acc[session.cohortId] = [];
    acc[session.cohortId].push(session);
    return acc;
  }, {});

  const stats = {
    total: mockDiscipleshipSessions.length,
    upcoming: mockDiscipleshipSessions.filter(s => !s.isCompleted).length,
    completed: mockDiscipleshipSessions.filter(s => s.isCompleted).length,
    virtual: mockDiscipleshipSessions.filter(s => s.type === 'virtual').length,
  };

  return (
    <DiscipleshipLayout title="Schedule">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Class Schedule</h1>
          <p className="text-gray-500">All discipleship class sessions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
          <Calendar className="w-5 h-5 text-[#BF0A30] mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Sessions</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <Clock className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          <p className="text-sm text-gray-500">Upcoming</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-green-200 dark:border-green-800 p-4">
          <Calendar className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-[#12151C] rounded-xl border border-purple-200 dark:border-purple-800 p-4">
          <Video className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-purple-600">{stats.virtual}</p>
          <p className="text-sm text-gray-500">Virtual Sessions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Cohort</label>
            <select
              className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white"
              value={filterCohort}
              onChange={e => setFilterCohort(e.target.value)}
            >
              <option value="all">All Cohorts</option>
              {mockDiscipleshipCohorts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                showCompleted
                  ? 'bg-gray-700 text-white border-gray-700'
                  : 'border-white/10 dark:border-[#2D2D2D] text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          </div>
        </div>
      </div>

      {/* Sessions grouped by cohort */}
      {Object.entries(grouped).map(([cohortId, cohortSessions]) => {
        const cohort = mockDiscipleshipCohorts.find(c => c.id === cohortId);
        const course = cohort ? mockDiscipleshipCourses.find(c => c.id === cohort.courseId) : null;

        return (
          <div key={cohortId} className="mb-6">
            {/* Cohort Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#BF0A30] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                L{cohort?.level}
              </div>
              <div>
                <h2 className="font-semibold text-white">{cohort?.name}</h2>
                <p className="text-xs text-gray-500">{course?.title} &bull; {cohort?.schedule}</p>
              </div>
            </div>

            <div className="bg-[#12151C] rounded-xl border border-white/[0.06]">
              <div className="divide-y divide-white/[0.06]">
                {cohortSessions
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(session => (
                    <div
                      key={session.id}
                      className={`flex items-start gap-4 p-4 hover:bg-white/[0.06] ${session.isCompleted ? 'opacity-60' : ''}`}
                    >
                      {/* Date Badge */}
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                        session.isCompleted ? 'bg-gray-100' : 'bg-[#BF0A30]/10'
                      }`}>
                        <p className={`text-xs font-medium ${session.isCompleted ? 'text-gray-500' : 'text-[#BF0A30]'}`}>
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className={`text-xl font-bold ${session.isCompleted ? 'text-gray-500' : 'text-[#BF0A30]'}`}>
                          {new Date(session.date).getDate()}
                        </p>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-white">{session.title}</p>
                          {session.isCompleted && (
                            <span className="px-2 py-0.5 text-xs bg-white/5 text-white/50 rounded-full">Done</span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${
                            session.type === 'virtual'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {session.type === 'virtual' ? 'Virtual' : 'Physical'}
                          </span>
                        </div>
                        {session.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{session.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />{session.startTime} - {session.endTime}
                          </span>
                          {session.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />{session.venue}
                            </span>
                          )}
                          {session.type === 'virtual' && session.meetingLink && (
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Session Number */}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs text-gray-400">Session {session.sessionNumber}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
      })}

      {Object.keys(grouped).length === 0 && (
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-12 text-center text-gray-500">
          No sessions found
        </div>
      )}
    </DiscipleshipLayout>
  );
}
