// pages/member/prayer-wall.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Heart, CheckCircle, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

type DBCategory = 'healing' | 'provision' | 'guidance' | 'family' | 'thanksgiving' | 'other';

const CATEGORIES: { value: DBCategory; label: string }[] = [
  { value: 'healing',      label: 'Healing' },
  { value: 'provision',    label: 'Provision' },
  { value: 'guidance',     label: 'Guidance' },
  { value: 'family',       label: 'Family' },
  { value: 'thanksgiving', label: 'Praise' },
  { value: 'other',        label: 'Other' },
];

const CAT_COLORS: Record<DBCategory, string> = {
  healing:      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  provision:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  guidance:     'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  family:       'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  thanksgiving: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  other:        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

interface PrayerRow {
  id:           string;
  user_id:      string | null;
  is_anonymous: boolean;
  category:     DBCategory;
  request:      string;
  status:       string;
  pray_count:   number;
  created_at:   string;
  profiles:     { full_name: string } | null;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export default function PrayerWallPage() {
  const router  = useRouter();
  const { profile } = useAuth();

  const [prayers,        setPrayers]        = useState<PrayerRow[]>([]);
  const [myReactions,    setMyReactions]    = useState<Set<string>>(new Set());
  const [loading,        setLoading]        = useState(true);
  const [filterCat,      setFilterCat]      = useState<DBCategory | 'all'>('all');
  const [showAnswered,   setShowAnswered]   = useState(false);

  // Form
  const [formText,       setFormText]       = useState('');
  const [formCategory,   setFormCategory]   = useState<DBCategory>('other');
  const [formAnonymous,  setFormAnonymous]  = useState(false);
  const [formIsUrgent,   setFormIsUrgent]   = useState(false);
  const [formLoading,    setFormLoading]    = useState(false);
  const [formSubmitted,  setFormSubmitted]  = useState(false);

  useEffect(() => { loadPrayers(); }, [profile?.id]);

  async function loadPrayers() {
    setLoading(true);
    const [{ data: prayerData }, { data: reactData }] = await Promise.all([
      db.from('prayer_requests')
        .select('id, user_id, is_anonymous, category, request, status, pray_count, created_at, profiles(full_name)')
        .in('status', ['pending', 'praying', 'answered'])
        .order('created_at', { ascending: false })
        .limit(50),
      profile?.id
        ? db.from('prayer_reactions').select('request_id').eq('user_id', profile.id)
        : Promise.resolve({ data: [] }),
    ]);
    setPrayers((prayerData ?? []) as PrayerRow[]);
    setMyReactions(new Set((reactData ?? []).map((r: any) => r.request_id)));
    setLoading(false);
  }

  async function togglePray(prayerId: string) {
    if (!profile?.id) return;
    const hasPrayed = myReactions.has(prayerId);

    // Optimistic update
    setPrayers(prev => prev.map(p =>
      p.id === prayerId ? { ...p, pray_count: p.pray_count + (hasPrayed ? -1 : 1) } : p
    ));
    setMyReactions(prev => {
      const s = new Set(prev);
      hasPrayed ? s.delete(prayerId) : s.add(prayerId);
      return s;
    });

    if (hasPrayed) {
      await db.from('prayer_reactions').delete()
        .eq('request_id', prayerId).eq('user_id', profile.id);
    } else {
      await db.from('prayer_reactions').insert({ request_id: prayerId, user_id: profile.id });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formText.trim()) return;
    setFormLoading(true);

    const { data: newPrayer } = await db.from('prayer_requests').insert({
      user_id:      profile?.id ?? null,
      is_anonymous: formAnonymous,
      category:     formCategory,
      request:      formText.trim(),
      is_urgent:    formIsUrgent,
    }).select('id, user_id, is_anonymous, category, request, status, pray_count, created_at, profiles(full_name)').single();

    if (newPrayer) {
      setPrayers(prev => [newPrayer as PrayerRow, ...prev]);
    }
    setFormText('');
    setFormIsUrgent(false);
    setFormAnonymous(false);
    setFormSubmitted(true);
    setFormLoading(false);
    setTimeout(() => setFormSubmitted(false), 4000);
  }

  const activePrayers   = prayers.filter(p => p.status !== 'answered');
  const answeredPrayers = prayers.filter(p => p.status === 'answered');
  const filtered        = activePrayers.filter(p => filterCat === 'all' || p.category === filterCat);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-black text-gray-900 dark:text-white text-base tracking-tight leading-tight">Prayer Wall</h1>
            <p className="text-[11px] text-gray-400 leading-tight">{activePrayers.length} active requests</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Submit Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5 lg:sticky lg:top-24">
              <h2 className="section-title mb-4">Submit a Prayer Request</h2>

              {formSubmitted && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-xl mb-4">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">Added to the wall.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Anonymous toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Post anonymously</span>
                  <button type="button" onClick={() => setFormAnonymous(a => !a)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${formAnonymous ? 'bg-[#BF0A30]' : 'bg-gray-300 dark:bg-[#3D3D3D]'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formAnonymous ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Category */}
                <div className="form-group !mb-0">
                  <label className="form-label">Category</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value as DBCategory)} className="select">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Urgent toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mark as urgent</span>
                  <button type="button" onClick={() => setFormIsUrgent(u => !u)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${formIsUrgent ? 'bg-amber-500' : 'bg-gray-300 dark:bg-[#3D3D3D]'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formIsUrgent ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Prayer text */}
                <div className="form-group !mb-0">
                  <label className="form-label">Prayer Request <span className="required">*</span></label>
                  <textarea value={formText} onChange={e => setFormText(e.target.value)}
                    placeholder="Share your prayer request..." rows={4} className="textarea" required />
                </div>

                <button type="submit" disabled={!formText.trim() || formLoading} className="btn btn-primary w-full">
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Post Prayer Request</>}
                </button>
              </form>
            </div>
          </div>

          {/* Prayer Cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setFilterCat('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filterCat === 'all' ? 'bg-[#BF0A30] text-white border-[#BF0A30]' : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/40'}`}>
                All
              </button>
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setFilterCat(c.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filterCat === c.value ? 'bg-[#BF0A30] text-white border-[#BF0A30]' : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/40'}`}>
                  {c.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-10 text-center">
                <Heart className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
                <p className="font-bold text-gray-500">No requests in this category</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map(prayer => {
                  const hasPrayed = myReactions.has(prayer.id);
                  const requester = prayer.is_anonymous
                    ? 'Anonymous'
                    : (prayer.profiles?.full_name ?? 'Member');
                  const initial = requester[0]?.toUpperCase() ?? '?';
                  return (
                    <div key={prayer.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xs font-black">
                            {prayer.is_anonymous ? '?' : initial}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{requester}</p>
                            <p className="text-[10px] text-gray-400">{fmtDate(prayer.created_at)}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${CAT_COLORS[prayer.category]}`}>
                          {CATEGORIES.find(c => c.value === prayer.category)?.label ?? prayer.category}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{prayer.request}</p>

                      <button onClick={() => togglePray(prayer.id)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          hasPrayed
                            ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-sm'
                            : 'bg-gray-50 dark:bg-[#252525] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#3D3D3D] hover:border-[#BF0A30]/50 hover:text-[#BF0A30]'
                        }`}>
                        <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-white' : ''}`} />
                        {hasPrayed ? 'I prayed for this' : 'Pray for this'}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${hasPrayed ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-[#3D3D3D] text-gray-600 dark:text-gray-400'}`}>
                          {prayer.pray_count}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Answered Prayers */}
            {answeredPrayers.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-900/40 overflow-hidden">
                <button onClick={() => setShowAnswered(s => !s)}
                  className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-800 dark:text-green-300 text-sm">
                      Answered Prayers ({answeredPrayers.length})
                    </span>
                  </div>
                  {showAnswered ? <ChevronUp className="w-4 h-4 text-green-600" /> : <ChevronDown className="w-4 h-4 text-green-600" />}
                </button>
                {showAnswered && (
                  <div className="border-t border-green-200 dark:border-green-900/40 p-4 space-y-3">
                    {answeredPrayers.map(prayer => (
                      <div key={prayer.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-green-200 dark:border-green-900/30 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {prayer.is_anonymous ? 'Anonymous' : (prayer.profiles?.full_name ?? 'Member')}
                          </p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CAT_COLORS[prayer.category]}`}>
                            {CATEGORIES.find(c => c.value === prayer.category)?.label ?? prayer.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{prayer.request}</p>
                        <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Answered · {fmtDate(prayer.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
