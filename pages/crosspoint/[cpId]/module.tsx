// pages/crosspoint/[cpId]/module.tsx
// Crosspoint leader view — weekly module shared by the church (reference material)

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  BookOpen, ChevronLeft, ChevronRight, Download, MessageSquare,
  CheckCircle, Clock, Users, Flame, Bookmark, Share2, Heart,
  ScrollText, HelpCircle, Feather
} from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { mockCrosspoints, mockCrosspointModules } from '@/data';

const MOCK_DATA = true;

// Enrich with content detail
const MODULES_ENRICHED = mockCrosspointModules.map(m => ({
  ...m,
  seriesName: 'Foundations of Faith',
  estimatedDuration: '60–90 mins',
  keyTheme: m.weekNumber === 1 ? 'Prayer & Intimacy' : m.weekNumber === 2 ? 'Purpose & Identity' : 'Community & Love',
  leaderTip: m.weekNumber === 1
    ? 'Open the session with a 5-minute group prayer. Let members take turns praying for one another.'
    : m.weekNumber === 2
    ? 'Encourage each member to share one thing they believe God has called them to. Keep it brief.'
    : 'This topic is personal — create a safe space. Remind members what is shared stays in the room.',
}));

export default function CrosspointModulePage() {
  const router = useRouter();
  const { cpId } = router.query;

  const [activeWeek,  setActiveWeek]  = useState(3); // default to current
  const [saved,       setSaved]       = useState(false);
  const [activeTab,   setActiveTab]   = useState<'content' | 'discussion' | 'prayer'>('content');

  const crosspoint = mockCrosspoints.find(c => c.id === cpId);
  const currentWeek = 3;
  const module = MODULES_ENRICHED.find(m => m.weekNumber === activeWeek);
  const totalWeeks = MODULES_ENRICHED.length;

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

  if (!module) {
    return (
      <CrosspointLayout crosspoint={crosspoint} title="Weekly Module">
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No module for Week {activeWeek}</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon — modules are released weekly</p>
        </div>
      </CrosspointLayout>
    );
  }

  const isCurrent = module.weekNumber === currentWeek;
  const isPast    = module.weekNumber < currentWeek;

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Weekly Module">

      {/* ── Week Picker ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActiveWeek(w => Math.max(1, w - 1))}
          disabled={activeWeek === 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2D2D2D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-2">
          {MODULES_ENRICHED.map(m => (
            <button
              key={m.weekNumber}
              onClick={() => setActiveWeek(m.weekNumber)}
              title={m.title}
              className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                m.weekNumber === activeWeek
                  ? 'bg-[#BF0A30] text-white shadow-md shadow-[#BF0A30]/25 scale-110'
                  : m.weekNumber < currentWeek
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : m.weekNumber === currentWeek
                  ? 'bg-red-100 dark:bg-red-900/30 text-[#BF0A30]'
                  : 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'
              }`}
            >
              {m.weekNumber}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveWeek(w => Math.min(totalWeeks, w + 1))}
          disabled={activeWeek === totalWeeks}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2D2D2D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Module Hero ──────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#BF0A30] via-[#A0021F] to-[#6B0015] rounded-2xl p-6 mb-6 text-white overflow-hidden">
        {/* crosshatch texture */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px',
        }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 opacity-5">
          <BookOpen className="w-full h-full" />
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase">
              Week {module.weekNumber}
            </span>
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold">
              {module.seriesName}
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

          <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">{module.title}</h1>
          <p className="text-white/80 font-semibold italic text-base mb-1">{module.scripture}</p>
          <p className="text-white/70 text-sm max-w-xl">{module.description}</p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              <Clock className="w-4 h-4" /> {module.estimatedDuration}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              <MessageSquare className="w-4 h-4" /> {module.discussionQuestions.length} questions
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              <Flame className="w-4 h-4" /> {module.prayerPoints.length} prayer points
            </span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setSaved(!saved)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  saved ? 'bg-white text-[#BF0A30]' : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-xs font-semibold text-white transition-colors">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Leader Tip ──────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-6">
        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
          <Feather className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Leader's Tip — Week {module.weekNumber}</p>
          <p className="text-sm text-amber-800 dark:text-amber-300">{module.leaderTip}</p>
        </div>
      </div>

      {/* ── Content Tabs ────────────────────────────────────────────────────── */}
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

      {/* ── Lesson Content ──────────────────────────────────────────────────── */}
      {activeTab === 'content' && (
        <div className="space-y-4 animate-fade-in">
          {/* Scripture Card */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[#BF0A30]" />
              </div>
              <h2 className="section-title">Key Scripture</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
              <p className="text-[#BF0A30] font-black text-xl mb-1">{module.scripture}</p>
              <p className="text-sm text-gray-500 italic">
                "For I know the plans I have for you…" — Read the passage aloud to open the session
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ScrollText className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h2 className="section-title">Lesson Content</h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line">
                {module.content}
              </p>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Theme</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{module.keyTheme}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Discussion Questions ─────────────────────────────────────────────── */}
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
              {module.discussionQuestions.map((question, i) => (
                <div key={i} className="flex gap-4 p-5 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-100 dark:border-[#333] hover:border-[#BF0A30]/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md shadow-[#BF0A30]/20">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium leading-relaxed">{question}</p>
                    <p className="text-xs text-gray-400 mt-2">Encourage everyone to respond</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">Facilitation Tip</p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Start with the first question as an icebreaker. Give everyone 60 seconds to think before sharing.
                Avoid answering first — let the group discover together.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Prayer Points ────────────────────────────────────────────────────── */}
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
              Close your crosspoint session by praying through these together. Assign one member to lead each point.
            </p>

            <div className="space-y-3">
              {module.prayerPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-100 dark:border-[#333] hover:border-red-200 dark:hover:border-red-900/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#8B0017] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#BF0A30]/20">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed pt-0.5">{point}</p>
                </div>
              ))}
            </div>

            {/* Closing reminder */}
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
              <p className="text-xs font-bold text-[#BF0A30] uppercase tracking-wider mb-1">Remember</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                End every crosspoint with prayer. Let the atmosphere shift. Some of the most powerful
                moments happen in those final minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── All Modules Strip ────────────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">All Modules — {MODULES_ENRICHED[0]?.seriesName}</h2>
          <span className="text-sm text-gray-400">{MODULES_ENRICHED.length} weeks</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES_ENRICHED.map(m => {
            const isActive = m.weekNumber === activeWeek;
            const mIsCurrent = m.weekNumber === currentWeek;
            const mIsPast = m.weekNumber < currentWeek;

            return (
              <button
                key={m.id}
                onClick={() => { setActiveWeek(m.weekNumber); setActiveTab('content'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                  isActive
                    ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-lg shadow-[#BF0A30]/20'
                    : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D] hover:border-gray-300 dark:hover:border-[#3D3D3D]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive    ? 'bg-white/20 text-white' :
                    mIsCurrent  ? 'bg-red-100 dark:bg-red-900/30 text-[#BF0A30]' :
                    mIsPast     ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                  'bg-gray-100 dark:bg-[#2A2A2A] text-gray-500'
                  }`}>
                    Week {m.weekNumber}{mIsCurrent ? ' · Now' : mIsPast ? ' · Done' : ''}
                  </span>
                  {mIsPast && !isActive && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <p className={`font-bold text-sm leading-snug mb-1 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {m.title}
                </p>
                <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                  {m.scripture}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Navigation Footer ─────────────────────────────────────────────────── */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-[#2D2D2D]">
        <button
          onClick={() => setActiveWeek(w => Math.max(1, w - 1))}
          disabled={activeWeek === 1}
          className="btn btn-secondary flex-1 gap-2 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Week {activeWeek - 1}
        </button>
        <button className="btn btn-secondary gap-2 px-4">
          <Download className="w-4 h-4" /> PDF
        </button>
        <button
          onClick={() => setActiveWeek(w => Math.min(totalWeeks, w + 1))}
          disabled={activeWeek === totalWeeks}
          className="btn btn-secondary flex-1 gap-2 disabled:opacity-40"
        >
          Week {activeWeek + 1} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </CrosspointLayout>
  );
}
