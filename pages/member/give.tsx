// pages/member/give.tsx
// Giving / donations page for members

import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Heart, CheckCircle, Clock, ChevronRight, TrendingUp
} from 'lucide-react';

const MOCK_DATA = true;

// ── Types ─────────────────────────────────────────────────────────────────────
type GivingType = 'tithe' | 'offering' | 'mission' | 'special';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: GivingType;
  reference: string;
  status: 'completed' | 'pending';
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn-001', date: '2026-04-27', amount: 5000, type: 'tithe',    reference: 'TXN-20260427', status: 'completed' },
  { id: 'txn-002', date: '2026-04-20', amount: 1000, type: 'offering', reference: 'TXN-20260420', status: 'completed' },
  { id: 'txn-003', date: '2026-03-30', amount: 2000, type: 'mission',  reference: 'TXN-20260330', status: 'completed' },
  { id: 'txn-004', date: '2026-03-10', amount: 5000, type: 'tithe',    reference: 'TXN-20260310', status: 'completed' },
];

const TOTAL_THIS_YEAR = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const GIVING_TYPES: { value: GivingType; label: string; description: string }[] = [
  { value: 'tithe',   label: 'Tithe',          description: 'First tenth of your income' },
  { value: 'offering', label: 'Offering',       description: 'Freewill gift to the church' },
  { value: 'mission', label: 'Mission',         description: 'Support missions and outreach' },
  { value: 'special', label: 'Special Project', description: 'Designated building / project fund' },
];

const TYPE_LABELS: Record<GivingType, string> = {
  tithe:   'Tithe',
  offering: 'Offering',
  mission:  'Mission',
  special:  'Special Project',
};

const TYPE_COLORS: Record<GivingType, string> = {
  tithe:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  offering: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  mission:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  special:  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function GivePage() {
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [givingType, setGivingType] = useState<GivingType>('tithe');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const effectiveAmount = customAmount
    ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0
    : selectedAmount ?? 0;

  function handleQuickAmount(amt: number) {
    setSelectedAmount(amt);
    setCustomAmount('');
  }

  function handleCustomAmountChange(val: string) {
    const digits = val.replace(/\D/g, '');
    setCustomAmount(digits);
    setSelectedAmount(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveAmount || effectiveAmount < 1) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-black text-gray-900 dark:text-white text-base tracking-tight leading-tight">Give</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Ruach Assemblies</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in">

        {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
        <div className="bg-hero rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-4 border-white" />
            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-2 border-white" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <img src="/brand/ruach-logo.png" alt="Ruach" className="w-10 h-10 rounded-full opacity-90" />
            </div>
            <div>
              <p className="text-white/70 text-xs uppercase tracking-widest font-bold mb-0.5">Ruach Assemblies</p>
              <h2 className="text-xl font-black tracking-tight leading-tight">Give to Ruach Assemblies</h2>
              <p className="text-white/70 text-sm mt-1 leading-relaxed">
                Every gift makes a difference in our community.
              </p>
            </div>
          </div>

          {/* Scripture */}
          <div className="relative z-10 mt-5 border-t border-white/20 pt-4">
            <p className="text-white/80 text-sm italic leading-relaxed">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
            </p>
            <p className="text-white/50 text-xs mt-1.5 font-semibold">2 Corinthians 9:7</p>
          </div>
        </div>

        {/* ── Total This Year Stat ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Given This Year</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{formatKES(TOTAL_THIS_YEAR)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Jan 2026 — Present</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* ── Give Form ────────────────────────────────────────────────────────── */}
        {submitted ? (
          <div className="alert alert-success animate-fade-in-scale">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
            <div>
              <p className="font-bold text-green-800 dark:text-green-300">Thank you for your giving!</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                Your {TYPE_LABELS[givingType].toLowerCase()} of {formatKES(effectiveAmount)} will be processed. Reference: TXN-{Date.now()}.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedAmount(null);
                  setCustomAmount('');
                  setNote('');
                }}
                className="mt-3 text-sm font-semibold text-green-700 dark:text-green-400 underline"
              >
                Give again
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5 space-y-5"
          >
            {/* Quick Amounts */}
            <div>
              <label className="form-label">Select Amount (KES)</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => handleQuickAmount(amt)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      selectedAmount === amt
                        ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-md shadow-[#BF0A30]/30'
                        : 'bg-gray-50 dark:bg-[#252525] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#3D3D3D] hover:border-[#BF0A30]/50'
                    }`}
                  >
                    {amt >= 1000 ? `${amt / 1000}K` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="form-group !mb-0">
              <label className="form-label">Or enter custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">KES</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customAmount ? parseInt(customAmount).toLocaleString('en-KE') : ''}
                  onChange={e => handleCustomAmountChange(e.target.value)}
                  placeholder="0"
                  className="input pl-14"
                />
              </div>
            </div>

            {/* Giving Type */}
            <div className="form-group !mb-0">
              <label className="form-label">Giving Type</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {GIVING_TYPES.map(type => (
                  <button
                    type="button"
                    key={type.value}
                    onClick={() => setGivingType(type.value)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      givingType === type.value
                        ? 'border-[#BF0A30] bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-[#2D2D2D] bg-gray-50 dark:bg-[#252525] hover:border-[#BF0A30]/40'
                    }`}
                  >
                    <p className={`text-sm font-bold ${givingType === type.value ? 'text-[#BF0A30]' : 'text-gray-800 dark:text-gray-200'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="form-group !mb-0">
              <label className="form-label">
                Reference / Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Family tithe, Easter offering..."
                className="input"
              />
            </div>

            {/* Amount Summary */}
            {effectiveAmount > 0 && (
              <div className="bg-gray-50 dark:bg-[#252525] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">You are giving</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                    {formatKES(effectiveAmount)}
                  </p>
                  <p className="text-xs text-gray-400">{TYPE_LABELS[givingType]}</p>
                </div>
                <Heart className="w-8 h-8 text-[#BF0A30]" />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!effectiveAmount || effectiveAmount < 1 || isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <span className="spinner spinner-sm border-white border-t-transparent" />
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Give Now — {effectiveAmount > 0 ? formatKES(effectiveAmount) : 'Enter an amount'}
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              Payments are processed securely. Integration coming soon.
            </p>
          </form>
        )}

        {/* ── Giving History ────────────────────────────────────────────────────── */}
        <div>
          <h2 className="section-title mb-3">Your Giving History</h2>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] divide-y divide-gray-100 dark:divide-[#2D2D2D] overflow-hidden">
            {MOCK_TRANSACTIONS.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#252525] flex items-center justify-center flex-shrink-0">
                    {txn.status === 'completed'
                      ? <CheckCircle className="w-5 h-5 text-green-500" />
                      : <Clock className="w-5 h-5 text-amber-500" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{TYPE_LABELS[txn.type]}</p>
                    <p className="text-xs text-gray-400">{formatDate(txn.date)} · {txn.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatKES(txn.amount)}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_COLORS[txn.type]}`}>
                    {TYPE_LABELS[txn.type]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
