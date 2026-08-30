import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, BarChart2, ChevronRight, Loader2 } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { supabase } from '@/lib/supabase';

const levelColors = [
  { bg: 'bg-blue-600', light: 'bg-blue-100 text-blue-800' },
  { bg: 'bg-green-600', light: 'bg-green-100 text-green-800' },
  { bg: 'bg-purple-600', light: 'bg-purple-100 text-purple-800' },
];

// Keyed by level (1-3), not id — course ids are DB UUIDs, but the topic
// outline is fixed content independent of which row happens to exist.
const courseTopics: Record<number, string[]> = {
  1: [
    'The Gospel & Salvation', 'Authority of Scripture', 'Prayer & Communion with God',
    'The Holy Spirit', 'Water Baptism', 'Christian Community', 'Spiritual Disciplines', 'Living with Purpose',
  ],
  2: [
    'Deep Bible Study Methods', 'Character & Integrity', 'Understanding Spiritual Gifts',
    'Kingdom Finances', 'Worship & Praise', 'Overcoming Temptation', 'Christian Relationships',
    'Spiritual Warfare', 'Evangelism Basics', 'Final Assessment',
  ],
  3: [
    'Foundations of Leadership', 'Servant Leadership', 'Vision & Mission', 'Discipling Others',
    'Preaching & Teaching', 'Pastoral Care', 'Church Government', 'Ministry Skills',
    'Cross-Cultural Ministry', 'Church Planting Principles', 'Leadership & Accountability', 'Multiplication & Legacy',
  ],
};

interface Course {
  id: string; level: number; title: string; description: string;
  total_sessions: number; duration_weeks: number; prerequisite_level: number | null;
}
interface Cohort { id: string; course_id: string; status: string; }

export default function DiscipleshipCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [coursesRes, cohortsRes] = await Promise.all([
      supabase.from('discipleship_courses').select('id, level, title, description, total_sessions, duration_weeks, prerequisite_level').order('level'),
      supabase.from('discipleship_cohorts').select('id, course_id, status'),
    ]);
    setCourses(coursesRes.data ?? []);
    setCohorts(cohortsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <DiscipleshipLayout title="Courses"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></DiscipleshipLayout>;
  }

  return (
    <DiscipleshipLayout title="Courses">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">KDC Course Levels</h1>
          <p className="text-gray-500">Kingdom Discipleship Classes - 3 progressive levels</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-2xl p-6 text-white mb-6">
        <h2 className="text-lg font-bold mb-1">Kingdom Discipleship Class (KDC)</h2>
        <p className="text-white/80 text-sm leading-relaxed">
          A structured 3-level discipleship program designed to build believers from new converts into mature, multiplying disciples. Each level builds on the previous and has its own cohorts, sessions, and assessments.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-2xl font-bold">{courses.length}</p>
            <p className="text-white/70 text-xs">Levels</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{courses.reduce((s, c) => s + c.total_sessions, 0)}</p>
            <p className="text-white/70 text-xs">Total Sessions</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{courses.reduce((s, c) => s + c.duration_weeks, 0)}</p>
            <p className="text-white/70 text-xs">Weeks</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {courses.map((course, idx) => {
          const colors = levelColors[idx] || levelColors[0];
          const courseCohorts = cohorts.filter(c => c.course_id === course.id);
          const activeCohorts = courseCohorts.filter(c => c.status === 'active');
          const topics = courseTopics[course.level] || [];

          return (
            <div key={course.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-[#2D2D2D]">
                <div className={`w-16 h-16 rounded-xl ${colors.bg} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                  L{course.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{course.title}</h2>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${colors.light}`}>Level {course.level}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{course.description}</p>
                  {course.prerequisite_level && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Prerequisite: Level {course.prerequisite_level} completion required</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-[#2D2D2D] border-b border-gray-100 dark:border-[#2D2D2D]">
                <div className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />Duration
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{course.duration_weeks} weeks</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <BookOpen className="w-3.5 h-3.5" />Sessions
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{course.total_sessions}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <BarChart2 className="w-3.5 h-3.5" />Active Cohorts
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{activeCohorts.length}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <BarChart2 className="w-3.5 h-3.5" />Total Cohorts
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{courseCohorts.length}</p>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Topics Covered</h3>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-[#252525] flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0">
                        {i + 1}
                      </span>
                      {topic}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <Link
                    href={`/discipleship/cohorts?level=${course.level}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"
                  >
                    View Cohorts<ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DiscipleshipLayout>
  );
}
