// pages/member/prayer-wall.tsx
// Public prayer wall — submit and pray for requests

import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Heart, CheckCircle, ChevronDown, ChevronUp, Send, Filter
} from 'lucide-react';

const MOCK_DATA = true;

// ── Types ─────────────────────────────────────────────────────────────────────
type PrayerCategory = 'Personal' | 'Family' | 'Health' | 'Work' | 'Church' | 'Nation';

interface PrayerCard {
  id: string;
  requester: string;
  isAnonymous: boolean;
  category: PrayerCategory;
  text: string;
  date: string;
  prayCount: number;
  isAnswered: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const INITIAL_CARDS: PrayerCard[] = [
  {
    id: 'pw-001',
    requester: 'Mary W.',
    isAnonymous: false,
    category: 'Health',
    text: 'Please pray for my mother who is recovering from surgery. She needs strength and complete healing.',
    date: '2026-05-08',
    prayCount: 14,
    isAnswered: false,
  },
  {
    id: 'pw-002',
    requester: '',
    isAnonymous: true,
    category: 'Work',
    text: 'I have been searching for employment for three months. Believing God for a breakthrough this week.',
    date: '2026-05-07',
    prayCount: 22,
    isAnswered: false,
  },
  {
    id: 'pw-003',
    requester: '',
    isAnonymous: true,
    category: 'Family',
    text: 'Praying for restoration in my marriage. We are going through a very difficult season. Please intercede.',
    date: '2026-05-06',
    prayCount: 31,
    isAnswered: false,
  },
  {
    id: 'pw-004',
    requester: 'James K.',
    isAnonymous: false,
    category: 'Church',
    text: 'Lift up our upcoming Kingdom Woman Conference. May every woman be transformed by the encounter with God.',
    date: '2026-05-05',
    prayCount: 18,
    isAnswered: false,
  },
  {
    id: 'pw-005',
    requester: 'Grace N.',
    isAnonymous: false,
    category: 'Nation',
    text: 'Let us pray for Kenya — for righteous leadership, peace and economic recovery for every household.',
    date: '2026-05-04',
    prayCount: 45,
    isAnswered: false,
  },
  {
    id: 'pw-006',
    requester: 'David N.',
    isAnonymous: false,
    category: 'Personal',
    text: 'Praising God for a successful business deal that came through this week! He is faithful! Thank you all for your prayers.',
    date: '2026-04-28',
    prayCount: 38,
    isAnswered: true,
  },
];

const CATEGORIES: PrayerCategory[] = ['Personal', 'Family', 'Health', 'Work', 'Church', 'Nation'];

const CATEGORY_COLORS: Record<PrayerCategory, string> = {
  Personal: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  Family:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Health:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  Work:     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  Church:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Nation:   'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export default function PrayerWallPage() {
  const router = useRouter();

  // Form state
  const [formName, setFormName] = useState('');
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState<PrayerCategory>('Personal');
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Cards state
  const [cards, setCards] = useState<PrayerCard[]>(INITIAL_CARDS);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<PrayerCategory | 'All'>('All');
  const [showAnswered, setShowAnswered] = useState(false);

  const activeCards  = cards.filter(c => !c.isAnswered);
  const answeredCards = cards.filter(c => c.isAnswered);

  const filteredActive = activeCards.filter(
    c => filterCategory === 'All' || c.category === filterCategory
  );

  function handlePray(id: string) {
    if (prayedIds.has(id)) {
      setPrayedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      setCards(prev => prev.map(c => c.id === id ? { ...c, prayCount: c.prayCount - 1 } : c));
    } else {
      setPrayedIds(prev => new Set(prev).add(id));
      setCards(prev => prev.map(c => c.id === id ? { ...c, prayCount: c.prayCount + 1 } : c));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formText.trim()) return;
    setFormLoading(true);
    setTimeout(() => {
      const newCard: PrayerCard = {
        id: `pw-${Date.now()}`,
        requester: formAnonymous ? '' : (formName.trim() || 'Someone'),
        isAnonymous: formAnonymous,
        category: formCategory,
        text: formText.trim(),
        date: new Date().toISOString().split('T')[0],
        prayCount: 0,
        isAnswered: false,
      };
      setCards(prev => [newCard, ...prev]);
      setFormText('');
      setFormName('');
      setFormAnonymous(false);
      setFormSubmitted(true);
      setFormLoading(false);
      setTimeout(() => setFormSubmitted(false), 4000);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-black text-gray-900 dark:text-white text-base tracking-tight leading-tight">Prayer Wall</h1>
            <p className="text-[11px] text-gray-400 leading-tight">{activeCards.length} active requests</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Submit Form ───────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5 lg:sticky lg:top-24">
              <h2 className="section-title mb-4">Submit a Prayer Request</h2>

              {formSubmitted && (
                <div className="alert alert-success mb-4 animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Your request has been added to the wall.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Anonymous toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-xl">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Post anonymously</span>
                  <button
                    type="button"
                    onClick={() => setFormAnonymous(a => !a)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      formAnonymous ? 'bg-[#BF0A30]' : 'bg-gray-300 dark:bg-[#3D3D3D]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formAnonymous ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Name (if not anonymous) */}
                {!formAnonymous && (
                  <div className="form-group !mb-0">
                    <label className="form-label">Your Name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. David M."
                      className="input"
                    />
                  </div>
                )}

                {/* Category */}
                <div className="form-group !mb-0">
                  <label className="form-label">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as PrayerCategory)}
                    className="select"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Prayer text */}
                <div className="form-group !mb-0">
                  <label className="form-label">Prayer Request <span className="required">*</span></label>
                  <textarea
                    value={formText}
                    onChange={e => setFormText(e.target.value)}
                    placeholder="Share your prayer request with the community..."
                    rows={4}
                    className="textarea"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formText.trim() || formLoading}
                  className="btn btn-primary w-full"
                >
                  {formLoading
                    ? <span className="spinner spinner-sm border-white border-t-transparent" />
                    : <><Send className="w-4 h-4" />Post Prayer Request</>
                  }
                </button>
              </form>
            </div>
          </div>

          {/* ── Right: Prayer Cards ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Filter by category */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['All', ...CATEGORIES] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    filterCategory === cat
                      ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-sm'
                      : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Active cards */}
            {filteredActive.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-10 text-center">
                <Heart className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
                <p className="font-bold text-gray-500">No requests in this category</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredActive.map(card => {
                  const hasPrayed = prayedIds.has(card.id);
                  return (
                    <div
                      key={card.id}
                      className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-4 flex flex-col gap-3"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xs font-black">
                            {card.isAnonymous ? '?' : card.requester[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              {card.isAnonymous ? 'Anonymous' : card.requester}
                            </p>
                            <p className="text-[10px] text-gray-400">{formatDate(card.date)}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${CATEGORY_COLORS[card.category]}`}>
                          {card.category}
                        </span>
                      </div>

                      {/* Text */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                        {card.text}
                      </p>

                      {/* Pray button */}
                      <button
                        onClick={() => handlePray(card.id)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          hasPrayed
                            ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-sm'
                            : 'bg-gray-50 dark:bg-[#252525] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#3D3D3D] hover:border-[#BF0A30]/50 hover:text-[#BF0A30]'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-white' : ''}`} />
                        {hasPrayed ? 'I prayed for this' : 'Pray for this'}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${hasPrayed ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-[#3D3D3D] text-gray-600 dark:text-gray-400'}`}>
                          {card.prayCount}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Answered Prayers (collapsible) */}
            {answeredCards.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-900/40 overflow-hidden">
                <button
                  onClick={() => setShowAnswered(s => !s)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-800 dark:text-green-300 text-sm">
                      Answered Prayers ({answeredCards.length})
                    </span>
                  </div>
                  {showAnswered
                    ? <ChevronUp className="w-4 h-4 text-green-600" />
                    : <ChevronDown className="w-4 h-4 text-green-600" />
                  }
                </button>

                {showAnswered && (
                  <div className="border-t border-green-200 dark:border-green-900/40 p-4 space-y-3">
                    {answeredCards.map(card => (
                      <div key={card.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-green-200 dark:border-green-900/30 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {card.isAnonymous ? 'Anonymous' : card.requester}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[card.category]}`}>
                            {card.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{card.text}</p>
                        <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Answered — {formatDate(card.date)}
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
