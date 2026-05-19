// pages/onboarding/index.tsx
// Guided onboarding journey for new members after Connect class graduation

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle, ChevronRight, ArrowRight, Home, BookOpen,
  GraduationCap, Star, MapPin, Clock, Users, Heart
} from 'lucide-react';
import { mockCrosspoints, mockDepartments } from '@/data';

const MOCK_DATA = true;

// ── Types ─────────────────────────────────────────────────────────────────────
interface OnboardingState {
  selectedCrosspointId: string | null;
  selectedDepartmentIds: string[];
  enrollInKDC: boolean | null;
}

const TOTAL_STEPS = 4;

// ── Zone labels ───────────────────────────────────────────────────────────────
const ZONE_LABELS: Record<string, string> = {
  west:  'West Zone',
  east:  'East Zone',
  south: 'South Zone',
  north: 'North Zone',
};

// ── Department icons without emojis (use lucide) ─────────────────────────────
const DEPT_ICON_MAP: Record<string, React.ElementType> = {
  'r-kids':          Star,
  'trendsetters':    Star,
  'bridge':          Users,
  'crosspoints':     Home,
  'r-warriors':      Star,
  'kingdom-woman':   Heart,
  'marriage':        Heart,
  'r-worship':       Star,
  'media':           Star,
  'intercessors':    Heart,
  'evangelists':     Star,
  'hospitality':     Users,
  'care-counselling': Heart,
  'guest-experience': Star,
};

const DEPT_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  'r-kids':          { bg: 'bg-pink-50 dark:bg-pink-900/20',    icon: 'text-pink-600',   border: 'border-pink-200 dark:border-pink-900/40' },
  'trendsetters':    { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600', border: 'border-orange-200 dark:border-orange-900/40' },
  'bridge':          { bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'text-blue-600',   border: 'border-blue-200 dark:border-blue-900/40' },
  'crosspoints':     { bg: 'bg-green-50 dark:bg-green-900/20',  icon: 'text-green-600',  border: 'border-green-200 dark:border-green-900/40' },
  'r-warriors':      { bg: 'bg-red-50 dark:bg-red-900/20',      icon: 'text-red-600',    border: 'border-red-200 dark:border-red-900/40' },
  'kingdom-woman':   { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600', border: 'border-purple-200 dark:border-purple-900/40' },
  'marriage':        { bg: 'bg-rose-50 dark:bg-rose-900/20',    icon: 'text-rose-600',   border: 'border-rose-200 dark:border-rose-900/40' },
  'r-worship':       { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-600',  border: 'border-amber-200 dark:border-amber-900/40' },
  'media':           { bg: 'bg-gray-50 dark:bg-gray-900/20',    icon: 'text-gray-600',   border: 'border-gray-200 dark:border-gray-900/40' },
  'intercessors':    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-600', border: 'border-indigo-200 dark:border-indigo-900/40' },
  'evangelists':     { bg: 'bg-teal-50 dark:bg-teal-900/20',   icon: 'text-teal-600',   border: 'border-teal-200 dark:border-teal-900/40' },
  'hospitality':     { bg: 'bg-cyan-50 dark:bg-cyan-900/20',   icon: 'text-cyan-600',   border: 'border-cyan-200 dark:border-cyan-900/40' },
  'care-counselling':{ bg: 'bg-lime-50 dark:bg-lime-900/20',   icon: 'text-lime-600',   border: 'border-lime-200 dark:border-lime-900/40' },
  'guest-experience':{ bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600', border: 'border-violet-200 dark:border-violet-900/40' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-50 dark:bg-gray-900/20', icon: 'text-gray-600', border: 'border-gray-200 dark:border-gray-900/40' };

// Show only departments that are appropriate for new members to join
const JOINABLE_DEPT_IDS = [
  'bridge', 'crosspoints', 'r-warriors', 'kingdom-woman', 'r-worship',
  'media', 'intercessors', 'evangelists', 'hospitality', 'guest-experience',
];

export default function OnboardingPage() {
  const [step, setStep]               = useState(1);
  const [state, setState]             = useState<OnboardingState>({
    selectedCrosspointId:  null,
    selectedDepartmentIds: [],
    enrollInKDC:           null,
  });
  const [filterZone, setFilterZone]   = useState<string>('all');
  const [completed, setCompleted]     = useState(false);

  const joinableDepts = mockDepartments.filter(d => JOINABLE_DEPT_IDS.includes(d.id));
  const zones = ['all', ...Array.from(new Set(mockCrosspoints.map(cp => cp.zone)))];

  const filteredCrosspoints = filterZone === 'all'
    ? mockCrosspoints
    : mockCrosspoints.filter(cp => cp.zone === filterZone);

  function selectCrosspoint(id: string) {
    setState(s => ({ ...s, selectedCrosspointId: s.selectedCrosspointId === id ? null : id }));
  }

  function toggleDepartment(id: string) {
    setState(s => {
      const already = s.selectedDepartmentIds.includes(id);
      if (already) {
        return { ...s, selectedDepartmentIds: s.selectedDepartmentIds.filter(d => d !== id) };
      }
      if (s.selectedDepartmentIds.length >= 2) return s; // max 2
      return { ...s, selectedDepartmentIds: [...s.selectedDepartmentIds, id] };
    });
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else setCompleted(true);
  }

  function handleBack() {
    if (step > 1) setStep(s => s - 1);
  }

  const canProceed =
    step === 1 ? true
    : step === 2 ? !!state.selectedCrosspointId
    : step === 3 ? state.selectedDepartmentIds.length > 0
    : state.enrollInKDC !== null;

  // ── Completed Screen ─────────────────────────────────────────────────────────
  if (completed) {
    const cp = mockCrosspoints.find(c => c.id === state.selectedCrosspointId);
    return (
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center animate-fade-in-scale">
          {/* Celebration */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#BF0A30]/30">
            <Star className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Your Ruach Journey Has Begun
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Welcome to the family. You are now fully set up and connected to the life of the church.
          </p>

          {/* Summary */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Crosspoint</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{cp?.name ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Departments</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {state.selectedDepartmentIds
                    .map(id => mockDepartments.find(d => d.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Discipleship</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {state.enrollInKDC ? 'Enrolled in KDC Level 1' : 'Skipped for now'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/member" className="btn btn-primary btn-lg w-full">
              Go to Member Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            {cp && (
              <Link href="/member/crosspoints" className="btn btn-secondary w-full">
                View My Crosspoint
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step indicator ────────────────────────────────────────────────────────────
  const STEP_LABELS = ['Welcome', 'Crosspoint', 'Departments', 'Discipleship'];

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col">

      {/* ── Progress Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Step numbers */}
          <div className="flex items-center gap-0 mb-3">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isDone    = stepNum < step;
              const isActive  = stepNum === step;
              return (
                <div key={label} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs font-black ${
                      isDone
                        ? 'bg-[#BF0A30] border-[#BF0A30] text-white'
                        : isActive
                        ? 'bg-white dark:bg-[#1A1A1A] border-[#BF0A30] text-[#BF0A30]'
                        : 'bg-gray-100 dark:bg-[#252525] border-gray-200 dark:border-[#3D3D3D] text-gray-400'
                    }`}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : stepNum}
                    </div>
                    <p className={`text-[10px] font-semibold mt-1 leading-none text-center ${
                      isActive ? 'text-[#BF0A30]' : isDone ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
                    }`}>{label}</p>
                  </div>
                  {stepNum < TOTAL_STEPS && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                      isDone ? 'bg-[#BF0A30]' : 'bg-gray-200 dark:bg-[#2D2D2D]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* ── Step Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 animate-fade-in">

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-hero rounded-2xl p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white" />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight mb-2">
                  Congratulations!
                </h1>
                <p className="text-white/80 text-base leading-relaxed">
                  You have graduated from Connect Class and are now a full member of Ruach Assemblies.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Member ID</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white font-mono mt-0.5">RM-2026-0128</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white font-black text-base shadow-lg shadow-[#BF0A30]/20">
                  DM
                </div>
              </div>
              <div className="divider" />
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to the family, <span className="font-bold">David Mwangi</span>! This short onboarding will help you find your Crosspoint, explore departments, and get started on your discipleship journey.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 text-center italic">
                "For I know the plans I have for you, declares the Lord — plans to prosper you and not to harm you, plans to give you hope and a future."
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 font-bold">Jeremiah 29:11</p>
            </div>
          </div>
        )}

        {/* STEP 2: Join a Crosspoint */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Join a Crosspoint</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Crosspoints are home fellowships where you grow in community. Select one near you.
              </p>
            </div>

            {/* Zone filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {zones.map(zone => (
                <button
                  key={zone}
                  onClick={() => setFilterZone(zone)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all capitalize ${
                    filterZone === zone
                      ? 'bg-[#BF0A30] text-white border-[#BF0A30]'
                      : 'bg-white dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[#2D2D2D]'
                  }`}
                >
                  {zone === 'all' ? 'All Zones' : ZONE_LABELS[zone] ?? zone}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredCrosspoints.map(cp => {
                const isSelected = state.selectedCrosspointId === cp.id;
                const spotsLeft  = cp.maxMembers - cp.memberCount;
                return (
                  <button
                    key={cp.id}
                    onClick={() => selectCrosspoint(cp.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#BF0A30] bg-red-50 dark:bg-red-900/20 shadow-sm'
                        : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-bold ${isSelected ? 'text-[#BF0A30]' : 'text-gray-900 dark:text-white'}`}>
                            {cp.name}
                          </h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cp.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {cp.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" /> {cp.area}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" /> {cp.meetingDay}, {cp.meetingTime}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" /> {cp.memberCount}/{cp.maxMembers} members
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">{cp.venue}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 mt-0.5 transition-all ${
                        isSelected ? 'bg-[#BF0A30] border-[#BF0A30]' : 'border-gray-300 dark:border-[#3D3D3D]'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-[#BF0A30]/20">
                        <p className="text-xs text-[#BF0A30] font-semibold">
                          {spotsLeft > 0
                            ? `${spotsLeft} spots remaining`
                            : 'This group is at capacity — you will be waitlisted'}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Explore Departments */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Explore Departments</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Find where you can serve. Pick up to 2 departments that interest you.
              </p>
            </div>

            {state.selectedDepartmentIds.length > 0 && (
              <div className="alert alert-info">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-bold">{state.selectedDepartmentIds.length}/2 selected.</span>{' '}
                  {state.selectedDepartmentIds.length < 2 && 'You can pick one more.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {joinableDepts.map(dept => {
                const isSelected = state.selectedDepartmentIds.includes(dept.id);
                const isDisabled = !isSelected && state.selectedDepartmentIds.length >= 2;
                const colors = DEPT_COLORS[dept.id] ?? DEFAULT_COLOR;
                const Icon = DEPT_ICON_MAP[dept.id] ?? Star;

                return (
                  <button
                    key={dept.id}
                    onClick={() => !isDisabled && toggleDepartment(dept.id)}
                    disabled={isDisabled}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#BF0A30] bg-red-50 dark:bg-red-900/20 shadow-sm'
                        : isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D]'
                        : `bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D] hover:${colors.border}`
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.bg}`}>
                        <Icon className={`w-4.5 h-4.5 ${colors.icon}`} />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#BF0A30] flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className={`text-xs font-bold leading-snug ${isSelected ? 'text-[#BF0A30]' : 'text-gray-900 dark:text-white'}`}>
                      {dept.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{dept.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{dept.memberCount} members</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Discipleship */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Kingdom Discipleship</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The KDC program is a 3-level journey that deepens your faith, character, and leadership.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5 space-y-4">
              {[
                { level: 1, title: 'Level 1 — Foundation', desc: 'Core beliefs, spiritual disciplines, and the basics of kingdom living.' },
                { level: 2, title: 'Level 2 — Growth',     desc: 'Deepening your walk, understanding your calling, and serving in community.' },
                { level: 3, title: 'Level 3 — Leadership', desc: 'Equipping leaders to disciple others and multiply the kingdom.' },
              ].map(lvl => (
                <div key={lvl.level} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 dark:text-amber-400 text-xs font-black">{lvl.level}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{lvl.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{lvl.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Would you like to enroll now?</p>

              <button
                onClick={() => setState(s => ({ ...s, enrollInKDC: true }))}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  state.enrollInKDC === true
                    ? 'border-[#BF0A30] bg-red-50 dark:bg-red-900/20 shadow-sm'
                    : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${state.enrollInKDC === true ? 'text-[#BF0A30]' : 'text-gray-900 dark:text-white'}`}>
                      Yes, enroll me in KDC Level 1
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Next cohort begins June 2026</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    state.enrollInKDC === true ? 'bg-[#BF0A30] border-[#BF0A30]' : 'border-gray-300 dark:border-[#3D3D3D]'
                  }`}>
                    {state.enrollInKDC === true && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setState(s => ({ ...s, enrollInKDC: false }))}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  state.enrollInKDC === false
                    ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-[#252525] shadow-sm'
                    : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${state.enrollInKDC === false ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                      Skip for now
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">You can enroll from your member dashboard anytime</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    state.enrollInKDC === false ? 'bg-gray-600 border-gray-600' : 'border-gray-300 dark:border-[#3D3D3D]'
                  }`}>
                    {state.enrollInKDC === false && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── Navigation Footer ─────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="btn btn-secondary"
          >
            Back
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i + 1 === step ? 'w-6 bg-[#BF0A30]' : i + 1 < step ? 'w-4 bg-[#BF0A30]/40' : 'w-4 bg-gray-200 dark:bg-[#2D2D2D]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn btn-primary"
          >
            {step === TOTAL_STEPS ? 'Finish' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
