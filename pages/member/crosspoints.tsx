// pages/member/crosspoints.tsx
// Member-facing: view your own crosspoint (read-only) + this week's module content

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Home, MapPin, Calendar, Clock, BookOpen, ArrowRightLeft,
  Loader2, X, Send, Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface MyCrosspoint {
  id: string; name: string; area: string; venue: string | null;
  meeting_day: string | null; meeting_time: string | null; status: string;
  profiles: { first_name: string; last_name: string } | null; // leader
}
interface CurrentWeek {
  module_title: string; series_name: string | null; week_number: number; title: string; scripture: string | null;
}
interface OtherCrosspoint { id: string; name: string; area: string }

export default function MemberCrosspointsPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [crosspoint, setCrosspoint] = useState<MyCrosspoint | null>(null);
  const [currentWeek, setCurrentWeek] = useState<CurrentWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [others, setOthers] = useState<OtherCrosspoint[]>([]);
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data: membership } = await supabase
      .from('crosspoint_memberships')
      .select('crosspoint_id, crosspoints(id, name, area, venue, meeting_day, meeting_time, status, profiles!leader_id(first_name, last_name))')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .maybeSingle();

    const cp = (membership as any)?.crosspoints ?? null;
    setCrosspoint(cp);

    if (cp) {
      const { data: progress } = await supabase
        .from('crosspoint_module_progress')
        .select('module_id, current_week, crosspoint_modules(title, series_name)')
        .eq('crosspoint_id', cp.id)
        .is('completed_at', null)
        .maybeSingle();

      if (progress) {
        const mod = (progress as any).crosspoint_modules;
        const { data: week } = await supabase
          .from('crosspoint_module_weeks')
          .select('week_number, title, scripture')
          .eq('module_id', (progress as any).module_id ?? '')
          .eq('week_number', progress.current_week)
          .maybeSingle();
        if (week) {
          setCurrentWeek({ module_title: mod?.title, series_name: mod?.series_name ?? null, week_number: week.week_number, title: week.title, scripture: week.scripture });
        }
      }
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/member/login'); return; }
    load();
  }, [authLoading, profile, router, load]);

  useEffect(() => {
    if (!showTransfer || !crosspoint) return;
    supabase.from('crosspoints').select('id, name, area').eq('status', 'active').neq('id', crosspoint.id).order('name')
      .then(({ data }) => setOthers(data ?? []));
  }, [showTransfer, crosspoint]);

  async function submitTransfer() {
    if (!profile || !crosspoint || !targetId || !reason.trim()) return;
    setSubmitting(true);
    await supabase.from('transfer_requests').insert({
      user_id: profile.id, from_crosspoint_id: crosspoint.id, to_crosspoint_id: targetId, reason: reason.trim(),
    });
    setSubmitting(false);
    setShowTransfer(false);
    setSubmitted(true);
    setTargetId('');
    setReason('');
  }

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#080808]"><Loader2 className="w-8 h-8 animate-spin text-[#BF0A30]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/member" className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"><ArrowLeft className="w-4 h-4" /></Link>
          <p className="font-black text-gray-900 dark:text-white text-sm">Crosspoint</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {submitted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-800 dark:text-green-200">
            Transfer request submitted. An admin will review it shortly.
          </div>
        )}

        {!crosspoint ? (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-dashed border-[#BF0A30]/50 p-8 text-center">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7 text-[#BF0A30]" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white mb-1">You're not in a Crosspoint yet</h2>
            <p className="text-sm text-gray-500 mb-5">Crosspoints are small home fellowship groups that meet weekly near you.</p>
            <Link href="/crosspoint/join" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-bold hover:bg-[#A0021F]">
              Find a Crosspoint
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#BF0A30] via-[#A0021F] to-[#6B0015] rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Your Crosspoint</p>
                  <h1 className="text-2xl font-black tracking-tight">{crosspoint.name}</h1>
                  <p className="text-white/80 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{crosspoint.area}</p>
                </div>
                <button onClick={() => setShowTransfer(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold transition-colors">
                  <ArrowRightLeft className="w-3.5 h-3.5" />Transfer
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/20 text-sm text-white/80">
                {crosspoint.meeting_day && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{crosspoint.meeting_day}s</span>}
                {crosspoint.meeting_time && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{crosspoint.meeting_time}</span>}
                {crosspoint.venue && <span className="flex items-center gap-1.5"><Home className="w-4 h-4" />{crosspoint.venue}</span>}
              </div>
              {crosspoint.profiles && (
                <p className="text-white/70 text-xs mt-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Led by {crosspoint.profiles.first_name} {crosspoint.profiles.last_name}</p>
              )}
            </div>

            {currentWeek ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#BF0A30]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Week {currentWeek.week_number} · {currentWeek.series_name ?? currentWeek.module_title}</p>
                  </div>
                </div>
                <h2 className="font-black text-gray-900 dark:text-white text-lg mb-1">{currentWeek.title}</h2>
                {currentWeek.scripture && <p className="text-sm text-[#BF0A30] font-semibold italic">{currentWeek.scripture}</p>}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5 text-center text-sm text-gray-500">
                No module content assigned to your crosspoint yet.
              </div>
            )}
          </>
        )}
      </main>

      {showTransfer && crosspoint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Request Crosspoint Transfer</h3>
              <button onClick={() => setShowTransfer(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transfer to</label>
                <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white">
                  <option value="">Select a crosspoint...</option>
                  {others.map(o => <option key={o.id} value={o.id}>{o.name} ({o.area})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea rows={3} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why would you like to transfer?" />
              </div>
            </div>
            <button onClick={submitTransfer} disabled={submitting || !targetId || !reason.trim()} className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white rounded-lg text-sm font-bold hover:bg-[#A0021F] disabled:opacity-50">
              <Send className="w-4 h-4" />{submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
