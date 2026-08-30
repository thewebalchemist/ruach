// pages/crosspoint/join.tsx
// Member crosspoint join flow — browse crosspoints by zone and request to join

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Home, MapPin, Users, ChevronRight, CheckCircle, Loader2, ArrowLeft, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Crosspoint {
  id: string;
  name: string;
  zone: 'N' | 'S' | 'E' | 'W' | string;
  venue: string | null;
  leader_id: string | null;
  status: string;
  member_count?: number;
  leader_name?: string;
}

const ZONE_LABELS: Record<string, string> = {
  N: 'North', S: 'South', E: 'East', W: 'West',
  north: 'North', south: 'South', east: 'East', west: 'West',
};

const ZONE_COLORS: Record<string, string> = {
  N: '#BF0A30', north: '#BF0A30',
  S: '#0891B2', south: '#0891B2',
  E: '#7C3AED', east: '#7C3AED',
  W: '#D4AF37', west: '#D4AF37',
};

export default function JoinCrosspointPage() {
  const router = useRouter();
  const [crosspoints, setCrosspoints] = useState<Crosspoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [joining, setJoining] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userMemberId, setUserMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      setUserId(session.session.user.id);
      const { data: profile } = await supabase.from('profiles').select('member_id, crosspoint_zone').eq('id', session.session.user.id).single() as any;
      if (profile?.member_id) setUserMemberId(profile.member_id);
      if (profile?.crosspoint_zone) setZone(profile.crosspoint_zone);
    }

    const { data } = await (supabase.from('crosspoints') as any)
      .select('id, name, zone, venue, leader_id, status')
      .eq('status', 'active')
      .order('zone');
    setCrosspoints(data || []);
    setLoading(false);
  }

  async function joinCrosspoint(cpId: string) {
    if (!userId) { router.push('/connect'); return; }
    setJoining(cpId); setError('');

    // Via RPC, not a direct upsert: crosspoint_memberships_update RLS is
    // staff-only, so a member re-joining a crosspoint they'd previously
    // left (existing inactive row) would otherwise hit the ON CONFLICT DO
    // UPDATE arm and be silently rejected.
    const { error: e } = await supabase.rpc('crosspoint_memberships_self_upsert', { p_crosspoint_id: cpId });

    if (e) {
      setError(e.message);
      setJoining(null);
      return;
    }

    // Update user's crosspoint zone
    const cp = crosspoints.find(c => c.id === cpId);
    if (cp?.zone) {
      await (supabase.from('profiles') as any).update({
        crosspoint_zone: cp.zone,
        is_in_crosspoint: true,
      }).eq('id', userId);
    }

    setJoining(null);
    setJoined(cpId);
  }

  const filtered = crosspoints
    .filter(c => zone === 'all' || c.zone === zone || c.zone === zone[0].toUpperCase())
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.venue || '').toLowerCase().includes(search.toLowerCase()));

  const zones = ['all', ...Array.from(new Set(crosspoints.map(c => c.zone)))];

  if (joined) {
    const cp = crosspoints.find(c => c.id === joined);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-[#2A2A2A] p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">You've joined!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-3">You are now part of <strong className="text-gray-900 dark:text-white">{cp?.name}</strong>.</p>
          {cp?.venue && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <MapPin className="w-4 h-4" />
              {cp.venue}
            </div>
          )}
          <Link
            href="/member/crosspoints"
            className="block w-full py-3 bg-[#BF0A30] hover:bg-[#A00828] text-white font-bold rounded-2xl transition-colors mb-3"
          >
            Go to My Crosspoint →
          </Link>
          <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-white dark:bg-[#111] border-b border-gray-100 dark:border-[#1E1E1E] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-[#BF0A30] rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 dark:text-white text-lg leading-tight">Join a Crosspoint</h1>
              <p className="text-xs text-gray-500">Find your home church in your zone</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* What is a Crosspoint */}
        <div className="bg-[#BF0A30]/6 dark:bg-[#BF0A30]/12 border border-[#BF0A30]/15 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">What is a Crosspoint?</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Crosspoints are our home churches — weekly gatherings of 15–30 people in your neighbourhood. They meet for worship, prayer, and life-sharing. Find the one closest to you and join!
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or area…"
            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
          />
        </div>

        {/* Zone filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {zones.map(z => {
            const label = z === 'all' ? 'All Zones' : (ZONE_LABELS[z] || z);
            const color = ZONE_COLORS[z] || '#BF0A30';
            const active = zone === z;
            return (
              <button
                key={z}
                onClick={() => setZone(z)}
                className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                style={active ? { background: color, color: '#fff' } : { background: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No crosspoints found.</p>
            {zone !== 'all' && <button onClick={() => setZone('all')} className="mt-2 text-sm text-[#BF0A30] font-medium hover:underline">Show all zones</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(cp => {
              const color = ZONE_COLORS[cp.zone] || '#BF0A30';
              const zoneName = ZONE_LABELS[cp.zone] || cp.zone;
              const isJoining = joining === cp.id;
              return (
                <div
                  key={cp.id}
                  className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                      <Home className="w-6 h-6" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{cp.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{zoneName}</span>
                            {cp.venue && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {cp.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && joining === null && <p className="text-sm text-red-500 mt-2">{error}</p>}

                  <button
                    onClick={() => joinCrosspoint(cp.id)}
                    disabled={isJoining}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    style={{ background: color }}
                  >
                    {isJoining ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</> : <>Join this Crosspoint <ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!userId && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl px-5 py-4">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Sign in to join</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">You need to be signed in as a church member to join a crosspoint.</p>
            <Link href="/connect" className="text-sm text-[#BF0A30] font-semibold hover:underline">Sign in →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
