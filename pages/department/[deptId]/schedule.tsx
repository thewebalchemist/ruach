import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Calendar, Clock, MapPin, Users, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments } from '@/data';

// Mock schedule data
const mockSchedule = [
  { id: 's1', title: 'Sunday First Service', date: '2026-02-08', time: '7:30 AM - 10:00 AM', venue: 'Main Sanctuary', assignedCount: 12, type: 'service' },
  { id: 's2', title: 'Sunday Second Service', date: '2026-02-08', time: '10:30 AM - 1:00 PM', venue: 'Main Sanctuary', assignedCount: 15, type: 'service' },
  { id: 's3', title: 'Wednesday Midweek', date: '2026-02-11', time: '6:00 PM - 8:00 PM', venue: 'Main Sanctuary', assignedCount: 8, type: 'service' },
  { id: 's4', title: 'Team Practice', date: '2026-02-12', time: '5:00 PM - 7:00 PM', venue: 'Fellowship Hall', assignedCount: 20, type: 'practice' },
  { id: 's5', title: 'Monthly Meeting', date: '2026-02-15', time: '2:00 PM - 4:00 PM', venue: 'Conference Room', assignedCount: 25, type: 'meeting' },
];

export default function DepartmentSchedulePage() {
  const router = useRouter();
  const { deptId } = router.query;
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const department = mockDepartments.find(d => d.id === deptId);
  
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-[#BF0A30] text-white';
      case 'practice': return 'bg-blue-500 text-white';
      case 'meeting': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <DepartmentLayout department={department} title="Schedule">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Schedule</h1>
          <p className="text-gray-500">Manage service schedules and events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-[#252525] rounded-lg p-1">
            <button 
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'list' ? 'bg-white dark:bg-[#1A1A1A] shadow-sm' : ''}`}
            >List</button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'calendar' ? 'bg-white dark:bg-[#1A1A1A] shadow-sm' : ''}`}
            >Calendar</button>
          </div>
          <Link href={`/department/${deptId}/schedule/new`} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" />Add Schedule
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-gray-500">Legend:</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#BF0A30]"></span>
          <span className="text-sm">Service</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-sm">Practice</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-sm">Meeting</span>
        </div>
      </div>

      {view === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {mockSchedule.map(event => (
            <div key={event.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 text-center flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-[#252525] rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Date(event.date).getDate()}</p>
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getTypeColor(event.type)}`}>{event.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.venue}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{event.assignedCount} assigned</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2D2D2D] flex gap-2">
                <Link href={`/department/${deptId}/schedule/${event.id}/assign`} className="px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg">Manage Assignments</Link>
                <Link href={`/department/${deptId}/schedule/${event.id}`} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg hover:bg-gray-50">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 1;
              const isCurrentMonth = dayNum > 0 && dayNum <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
              const hasEvent = mockSchedule.some(e => new Date(e.date).getDate() === dayNum);
              return (
                <div key={i} className={`min-h-[80px] p-2 border border-gray-100 dark:border-[#2D2D2D] rounded-lg ${!isCurrentMonth ? 'bg-gray-50 dark:bg-[#0F0F0F]' : ''}`}>
                  {isCurrentMonth && (
                    <>
                      <p className={`text-sm font-medium ${hasEvent ? 'text-[#BF0A30]' : 'text-gray-600 dark:text-gray-400'}`}>{dayNum}</p>
                      {hasEvent && <div className="mt-1 w-2 h-2 rounded-full bg-[#BF0A30]"></div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DepartmentLayout>
  );
}
