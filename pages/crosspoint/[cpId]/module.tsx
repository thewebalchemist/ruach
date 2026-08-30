// pages/crosspoint/[cpId]/module.tsx
// Crosspoint leader view — weekly module shared by the church (reference material)

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  BookOpen, ChevronLeft, ChevronRight, MessageSquare,
  CheckCircle, Flame, ScrollText, HelpCircle, Feather, Loader2,
} from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { useCrosspoint } from '@/hooks/useCrosspoint';
import { supabase } from '@/lib/supabase';

interface ModuleWeek {
  week_number: number; title: string; scripture: string | null; lesson_content: string;
  discussion_qs: string[]; prayer_points: string[]; leader_tips: string | null;
}
interface ModuleInfo { id: string; title: string; series_name: string | null; total_weeks: number }

export default function CrosspointModulePage() {
  const router = useRouter();
  const { cpId } = router.query as { cpId?: string };
  const { crosspoint, loading: cpLoading } = useCrosspoint(cpId);

  const [module, setModule] = useState<ModuleInfo | null>(null);
  const [weeks, setWeeks] = useState<ModuleWeek[]>([]);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [activeWeek, setActiveWeek] = useState(1);
  const [activeTab, setActiveTab] = useState<'content' | 'discussion' | 'prayer'>('content');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cpId) return;
    setLoading(true);
    const { data: progress } = await supabase
      .from('crosspoint_module_progress')
      .select('module_id, current_week, crosspoint_modules(id, title, series_name, total_weeks)')
      .eq('crosspoint_id', cpId)
      .is('completed_at', null)
      .maybeSingle();

    if (progress) {
      const mod = (progress as any).crosspoint_modules;
      setModule(mod);
      setCurrentWeekNumber(progress.current_week);
      setActiveWeek(progress.current_week);

      const { data: weekRows } = await supabase
        .from('crosspoint_module_weeks')
        .select('week_number, title, scripture, lesson_content, discussion_qs, prayer_points, leader_tips')
        .eq('module_id', progress.module_id)
        .order('week_number');
      setWeeks(weekRows ?? []);
    }
    setLoading(false);
  }, [cpId]);

  useEffect(() => { load(); }, [load]);

  const week = weeks.find(w => w.week_number === activeWeek);
  const isCurrent = activeWeek === currentWeekNumber;
  const isPast = activeWeek < currentWeekNumber;

  if (cpLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!crosspoint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F]">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Crosspoint not found</p>
          <Link href="/crosspoint" className="mt-4 inline-block text-[#BF0A30] text-sm">Back to Crosspoints</Link>
        </div>
      </div>
    );
  }

  if (!module || !week) {
    return (
      <CrosspointLayout crosspoint={crosspoint} title="Weekly Module">
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No module assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">A super admin needs to assign a curriculum module to this crosspoint.</p>
        </div>
      </CrosspointLayout>
    );
  }

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Weekly Module">

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActiveWeek(w => Math.max(1, w - 1))}
          disabled={activeWeek === 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2D2D2D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {weeks.map(w => (
            <button
              key={w.week_number}
              onClick={() => setActiveWeek(w.week_number)}
              title={w.title}
              className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                w.week_number === activeWeek
                  ? 'bg-[#BF0A30] text-white shadow-md shadow-[#BF0A30]/25 scale-110'
                  : w.week_number < currentWeekNumber
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : w.week_number === currentWeekNumber
                  ? 'bg-red-100 dark:bg-red-900/30 text-[#BF0A30]'
                  : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'
              }`}
            >
              {w.week_number}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveWeek(w => Math.min(module.total_weeks, w + 1))}
          disabled={activeWeek === module.total_weeks}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2D2D2D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative bg-gradient-to-br from-[#BF0A30] via-[#A0021F] to-[#6B0015] rounded-2xl p-6 mb-6 text-white overflow-hidden">
        <div className="absolute bottom-0 right-0 w-48 h-48 opacity-5">
          <BookOpen className="w-full h-full" />
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase">
              Week {week.week_number}
            </span>
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold">
              {module.series_name ?? module.title}
            </span>
            {isCurrent && (
              <span className="px-2.5 py-1 bg-white rounded-full text-xs font-black text-[#BF0A30]">
                This Week
              </span>
            )}
            {isPast && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3 h-3" /> Past
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">{week.title}</h1>
          {week.scripture && <p className="text-white/80 font-semibold italic text-base mb-1">{week.scripture}</p>}

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              <MessageSquare className="w-4 h-4" /> {week.discussion_qs.length} questions
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              <Flame className="w-4 h-4" /> {week.prayer_points.length} prayer points
            </span>
          </div>
        </div>
      </div>

      {week.leader_tips && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-6">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <Feather className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Leader's Tip — Week {week.week_number}</p>
            <p className="text-sm text-amber-800 dark:text-amber-300">{week.leader_tips}</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 dark:bg-[#1E1E1E] rounded-xl p-1 mb-6">
        {([
          { key: 'content',    label: 'Lesson Content', icon: ScrollText },
          { key: 'discussion', label: 'Discussion',     icon: HelpCircle },
          { key: 'prayer',     label: 'Prayer Points',  icon: Flame },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-4 animate-fade-in">
          {week.scripture && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-[#BF0A30]" />
                </div>
                <h2 className="section-title">Key Scripture</h2>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                <p className="text-[#BF0A30] font-black text-xl mb-1">{week.scripture}</p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ScrollText className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h2 className="section-title">Lesson Content</h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line">
                {week.lesson_content || 'No content added for this week yet.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discussion' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <h2 className="section-title">Discussion Questions</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Use these to guide your crosspoint conversation. Allow 10–15 minutes per question.
            </p>

            <div className="space-y-4">
              {week.discussion_qs.length === 0 ? (
                <p className="text-sm text-gray-500">No discussion questions added for this week yet.</p>
              ) : week.discussion_qs.map((question, i) => (
                <div key={i} className="flex gap-4 p-5 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-100 dark:border-[#333] hover:border-[#BF0A30]/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md shadow-[#BF0A30]/20">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium leading-relaxed">{question}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prayer' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-[#BF0A30]" />
              </div>
              <h2 className="section-title">Prayer Points</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Close your crosspoint session by praying through these together.
            </p>

            <div className="space-y-3">
              {week.prayer_points.length === 0 ? (
                <p className="text-sm text-gray-500">No prayer points added for this week yet.</p>
              ) : week.prayer_points.map((point, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-100 dark:border-[#333] hover:border-red-200 dark:hover:border-red-900/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#8B0017] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#BF0A30]/20">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed pt-0.5">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">All Weeks — {module.series_name ?? module.title}</h2>
          <span className="text-sm text-gray-400">{weeks.length} weeks</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {weeks.map(w => {
            const isActive = w.week_number === activeWeek;
            const wIsCurrent = w.week_number === currentWeekNumber;
            const wIsPast = w.week_number < currentWeekNumber;

            return (
              <button
                key={w.week_number}
                onClick={() => { setActiveWeek(w.week_number); setActiveTab('content'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                  isActive
                    ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-lg shadow-[#BF0A30]/20'
                    : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D] hover:border-gray-300 dark:hover:border-[#3D3D3D]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive    ? 'bg-white/20 text-white' :
                    wIsCurrent  ? 'bg-red-100 dark:bg-red-900/30 text-[#BF0A30]' :
                    wIsPast     ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                  'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'
                  }`}>
                    Week {w.week_number}{wIsCurrent ? ' · Now' : wIsPast ? ' · Done' : ''}
                  </span>
                  {wIsPast && !isActive && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <p className={`font-bold text-sm leading-snug mb-1 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {w.title}
                </p>
                {w.scripture && (
                  <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                    {w.scripture}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-[#2D2D2D]">
        <button
          onClick={() => setActiveWeek(w => Math.max(1, w - 1))}
          disabled={activeWeek === 1}
          className="btn btn-secondary flex-1 gap-2 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Week {activeWeek - 1}
        </button>
        <button
          onClick={() => setActiveWeek(w => Math.min(module.total_weeks, w + 1))}
          disabled={activeWeek === module.total_weeks}
          className="btn btn-secondary flex-1 gap-2 disabled:opacity-40"
        >
          Week {activeWeek + 1} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </CrosspointLayout>
  );
}
