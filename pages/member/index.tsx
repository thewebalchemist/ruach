// pages/member/index.tsx
// Member dashboard — membership card, journey progress, notices, quick actions

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Award, Users, GraduationCap, Home, Calendar, BookOpen,
  ChevronRight, Bell, LogOut, Settings, CheckCircle, Shield,
  Loader2, Star, Sun, Moon, Sparkles, Heart, MapPin, Hash,
  ArrowRight, MessageCircle, Gift
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from 'next-themes';

const MOCK_DATA = true;

// ── Types ─────────────────────────────────────────────────────────────────────
interface DiscProgressRow {
  level: 1 | 2 | 3;
  status: string;
  discipleship_cohorts: { name: string } | null;
}
interface NoticeRow { id: string; title: string; priority: string; }
interface DiscipleshipProgress { level: 1 | 2 | 3; status: string; cohort_name: string; }

// Mock profile for MOCK_DATA mode
const MOCK_PROFILE = {
  id:                   'mock-001',
  first_name:           'David',
  last_name:            'Mwangi',
  email:                'david.mwangi@example.com',
  role:                 'member',
  branch:               'ruach-tabernacle',
  member_id:            'RM-2024-0072',
  member_since:         '2024-03-15',
  connect_graduated_at: '2024-03-15',
  is_in_crosspoint:     true,
};

const MOCK_DISC_PROGRESS: DiscipleshipProgress = {
  level:       1,
  status:      'in-progress',
  cohort_name: 'KDC 101 — Cohort A',
};

const MOCK_NOTICES: NoticeRow[] = [
  { id: '1', title: 'Easter Sunday service — 6 AM, 9 AM, 12 PM', priority: 'high' },
  { id: '2', title: 'Connect Class registration for Cohort 8 is now open', priority: 'normal' },
];

const BRANCH_LABELS: Record<string, string> = {
  'ruach-tabernacle': 'Ruach Tabernacle',
  'ruach-east':       'Ruach East',
  'ruach-west':       'Ruach West',
  'ruach-south':      'Ruach South',
  'ruach-rivers':     'Ruach Rivers',
};

export default function MemberDashboard() {
  const router = useRouter();
  const { profile: authProfile, signOut, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const [discProgress, setDiscProgress] = useState<DiscipleshipProgress | null>(null);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [notices,      setNotices]      = useState<NoticeRow[]>([]);

  useEffect(() => {
    if (MOCK_DATA) {
      setDiscProgress(MOCK_DISC_PROGRESS);
      setNotices(MOCK_NOTICES);
      setPageLoading(false);
      return;
    }

    if (authLoading) return;
    if (!authProfile) { router.push('/connect'); return; }

    const memberRoles = ['member', 'leader', 'teacher', 'admin', 'pastor'];
    if (!memberRoles.includes(authProfile.role)) {
      router.push('/connect/student');
      return;
    }

    async function load() {
      const { data: discData } = await supabase
        .from('discipleship_students')
        .select('level, status, discipleship_cohorts ( name )')
        .eq('user_id', authProfile!.id)
        .order('level', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (discData) {
        const row = discData as unknown as DiscProgressRow;
        setDiscProgress({ level: row.level, status: row.status, cohort_name: row.discipleship_cohorts?.name ?? '' });
      }

      const { data: noticeData } = await supabase
        .from('notices')
        .select('id, title, priority')
        .in('scope', ['all', 'members'])
        .order('published_at', { ascending: false })
        .limit(3);

      setNotices((noticeData ?? []) as NoticeRow[]);
      setPageLoading(false);
    }

    load();
  }, [authProfile, authLoading, router]);

  if (!MOCK_DATA && (authLoading || pageLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#080808]">
        <Loader2 className="w-8 h-8 animate-spin text-[#BF0A30]" />
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#080808]">
        <Loader2 className="w-8 h-8 animate-spin text-[#BF0A30]" />
      </div>
    );
  }

  const profile = MOCK_DATA ? MOCK_PROFILE : authProfile;
  if (!profile) return null;

  const firstName    = profile.first_name;
  const lastName     = profile.last_name;
  const initials     = `${firstName[0]}${lastName[0]}`;
  const branchLabel  = BRANCH_LABELS[profile.branch] ?? profile.branch;
  const memberSince  = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
    : '—';
  const discCompleted = discProgress?.status === 'completed';
  const discEnrolled  = !!discProgress && !discCompleted;
  const discLevel     = discProgress?.level ?? 0;

  // Journey steps
  const journeySteps = [
    { label: 'Connect Class',    done: !!profile.connect_graduated_at, active: !profile.connect_graduated_at },
    { label: 'Crosspoint',       done: !!profile.is_in_crosspoint,     active: !!profile.connect_graduated_at && !profile.is_in_crosspoint },
    { label: 'Discipleship',     done: discCompleted,                   active: discEnrolled },
    { label: 'Serving',          done: false,                           active: discCompleted },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center shadow-md shadow-[#BF0A30]/20">
              <img src="/images/ruaach.png" alt="Ruach" className="w-6 h-6 rounded-full opacity-90" />
            </div>
            <div>
              <p className="font-black text-gray-900 dark:text-white text-sm leading-tight tracking-tight">RuachConnect</p>
              <p className="text-[10px] text-gray-400 leading-tight">Member Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <Bell className="w-4 h-4" />
              {notices.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full ring-2 ring-white dark:ring-[#111]" />}
            </button>
            <Link href="/member/settings" className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <Settings className="w-4 h-4" />
            </Link>
            <button onClick={MOCK_DATA ? undefined : signOut} className="p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fade-in">

        {/* ── Greeting ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white font-black text-base shadow-lg shadow-[#BF0A30]/20">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-gray-500">Member since {memberSince}</p>
          </div>
        </div>

        {/* ── Notices ─────────────────────────────────────────────────────────── */}
        {notices.length > 0 && (
          <div className="space-y-2">
            {notices.map(n => (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                n.priority === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
              }`}>
                <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {n.title}
              </div>
            ))}
          </div>
        )}

        {/* ── Membership Card ──────────────────────────────────────────────────── */}
        <div className="membership-card select-none p-6">
          {/* Card header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <img src="/images/ruaach.png" alt="Ruach" className="w-7 h-7 rounded-full opacity-80" />
              </div>
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold leading-none">Ruach Assemblies</p>
                <p className="text-white font-black text-sm tracking-tight leading-tight">Member Card</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
              {profile.connect_graduated_at
                ? <><CheckCircle className="w-3.5 h-3.5 text-green-400" /><span className="text-white/90 text-xs font-bold">Verified</span></>
                : <><Award className="w-3.5 h-3.5 text-amber-400" /><span className="text-white/90 text-xs font-bold">Active</span></>
              }
            </div>
          </div>

          {/* Member info */}
          <div className="mb-5">
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-0.5">Full Name</p>
            <p className="text-white text-xl font-black tracking-tight">{firstName} {lastName}</p>
          </div>

          {/* Card footer row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-0.5">Member ID</p>
              <p className="text-white font-black text-base tracking-widest font-mono">{profile.member_id ?? '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-0.5">Branch</p>
              <p className="text-white font-semibold text-sm">{branchLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-0.5">Since</p>
              <p className="text-white font-semibold text-sm">
                {profile.member_since
                  ? new Date(profile.member_since).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Gradient shine overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* ── Connect Graduate Banner ──────────────────────────────────────────── */}
        {profile.connect_graduated_at && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10">
              <GraduationCap className="w-full h-full" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-base">Connect Class Graduate</p>
              <p className="text-white/80 text-sm">
                Graduated {new Date(profile.connect_graduated_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-white/70 flex-shrink-0" />
          </div>
        )}

        {/* ── Journey Progress ─────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="section-title mb-4">Your Journey</h2>
          <div className="relative flex items-start gap-0">
            {journeySteps.map((step, i) => (
              <div key={step.label} className="flex-1 relative">
                {/* Connector line */}
                {i < journeySteps.length - 1 && (
                  <div className={`absolute top-4 left-1/2 right-0 h-0.5 z-0 ${
                    journeySteps[i + 1].done || journeySteps[i + 1].active
                      ? 'bg-[#BF0A30]' : 'bg-gray-200 dark:bg-[#2D2D2D]'
                  }`} />
                )}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.done
                      ? 'bg-[#BF0A30] border-[#BF0A30] shadow-lg shadow-[#BF0A30]/25'
                      : step.active
                      ? 'bg-white dark:bg-[#1A1A1A] border-[#BF0A30] shadow-md shadow-[#BF0A30]/20'
                      : 'bg-gray-100 dark:bg-[#2A2A2A] border-gray-200 dark:border-[#3D3D3D]'
                  }`}>
                    {step.done
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : step.active
                      ? <div className="w-2 h-2 rounded-full bg-[#BF0A30] animate-pulse" />
                      : <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    }
                  </div>
                  <p className={`text-[10px] font-semibold mt-2 text-center leading-tight ${
                    step.done || step.active
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cards: Crosspoint + Discipleship + Serving ───────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">

          {/* Crosspoint */}
          <div className={`bg-white dark:bg-[#1A1A1A] rounded-2xl border p-5 ${
            profile.is_in_crosspoint
              ? 'border-green-200 dark:border-green-900/40'
              : 'border-dashed border-[#BF0A30]/50'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              profile.is_in_crosspoint ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <Home className={`w-5 h-5 ${profile.is_in_crosspoint ? 'text-green-600' : 'text-[#BF0A30]'}`} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Crosspoint</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              {profile.is_in_crosspoint ? 'Active in home fellowship' : 'Join a home fellowship near you'}
            </p>
            <Link href="/member/crosspoints" className={`flex items-center gap-1 text-xs font-bold ${
              profile.is_in_crosspoint ? 'text-green-600' : 'text-[#BF0A30]'
            }`}>
              {profile.is_in_crosspoint ? 'View Crosspoint' : 'Find One'} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Discipleship */}
          <div className={`bg-white dark:bg-[#1A1A1A] rounded-2xl border p-5 ${
            discCompleted ? 'border-amber-200 dark:border-amber-900/40' : 'border-dashed border-amber-400/50'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Discipleship</h3>
            {discProgress ? (
              <p className="text-xs text-gray-500 mb-3">Level {discLevel} · {discProgress.status.replace('-', ' ')}</p>
            ) : (
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">3-level Kingdom Discipleship journey</p>
            )}
            <Link href="/discipleship/enroll" className="flex items-center gap-1 text-xs font-bold text-amber-600">
              {discEnrolled ? 'Continue' : discCompleted ? 'Certificate' : 'Enroll'} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Serving */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-dashed border-blue-400/50 p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Serving</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">Find your place in a ministry department</p>
            <Link href="/member/departments" className="flex items-center gap-1 text-xs font-bold text-blue-600">
              Explore <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────────────── */}
        <div>
          <h2 className="section-title mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/member/events',         icon: Calendar,        label: 'Events',          color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { href: '/member/prayer',          icon: MessageCircle,   label: 'Prayer Requests', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { href: '/member/giving',          icon: Gift,            label: 'Giving',          color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
              { href: '/member/connect-history', icon: BookOpen,        label: 'Connect History', color: 'text-[#BF0A30]',  bg: 'bg-red-50 dark:bg-red-900/20' },
            ].map(({ href, icon: Icon, label, color, bg }) => (
              <Link
                key={href} href={href}
                className="flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/40 hover:shadow-md transition-all text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="font-semibold text-xs text-gray-700 dark:text-gray-300 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Badges Earned ────────────────────────────────────────────────────── */}
        {(profile.connect_graduated_at || discLevel > 0) && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <h2 className="section-title mb-4">Badges Earned</h2>
            <div className="flex flex-wrap gap-3">
              {profile.connect_graduated_at && (
                <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl px-4 py-2.5">
                  <GraduationCap className="w-5 h-5 text-[#BF0A30]" />
                  <div>
                    <p className="text-xs font-black text-[#BF0A30] leading-none">Connect Graduate</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Class of {new Date(profile.connect_graduated_at).getFullYear()}</p>
                  </div>
                </div>
              )}
              {discLevel >= 1 && (
                <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl px-4 py-2.5">
                  <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                  <div>
                    <p className="text-xs font-black text-amber-700 dark:text-amber-400 leading-none">KDC Level 1</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Foundation</p>
                  </div>
                </div>
              )}
              {discLevel >= 2 && (
                <div className="flex items-center gap-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/40 rounded-xl px-4 py-2.5">
                  <Star className="w-5 h-5 text-orange-600 fill-orange-600" />
                  <div>
                    <p className="text-xs font-black text-orange-700 dark:text-orange-400 leading-none">KDC Level 2</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Growth</p>
                  </div>
                </div>
              )}
              {discLevel >= 3 && (
                <div className="flex items-center gap-2.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/40 rounded-xl px-4 py-2.5">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs font-black text-purple-700 dark:text-purple-400 leading-none">KDC Level 3</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Leadership</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
