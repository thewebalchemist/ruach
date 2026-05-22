// pages/member/suggestions.tsx
// Suggestion / feedback / complaint form for members

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Send, CheckCircle, Clock, Check, MessageSquare, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

// ── Types ─────────────────────────────────────────────────────────────────────
type SubmissionType = 'suggestion' | 'feedback' | 'complaint';
type SubmissionStatus = 'pending' | 'reviewing' | 'resolved';

interface Submission {
  id: string;
  type: SubmissionType;
  subject: string;
  message: string;
  status: SubmissionStatus;
  created_at: string;
  is_anonymous: boolean;
}

const SUBMISSION_TYPES: { value: SubmissionType; label: string }[] = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'feedback',   label: 'Feedback' },
  { value: 'complaint',  label: 'Complaint' },
];

const TYPE_COLORS: Record<SubmissionType, string> = {
  suggestion: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40',
  feedback:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900/40',
  complaint:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/40',
};

const TYPE_ACTIVE: Record<SubmissionType, string> = {
  suggestion: 'bg-blue-600 text-white border-blue-600 shadow-md',
  feedback:   'bg-green-600 text-white border-green-600 shadow-md',
  complaint:  'bg-red-600 text-white border-red-600 shadow-md',
};

const STATUS_CONFIG: Record<SubmissionStatus, { icon: React.ElementType; color: string; bg: string }> = {
  'pending':   { icon: Clock,       color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'reviewing': { icon: Clock,       color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  'resolved':  { icon: Check,       color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
};

const DEPARTMENTS = [
  'General',
  'Crosspoints',
  'Connect Class',
  'Discipleship (KDC)',
  'R-Kids Church',
  'Trendsetters',
  'Bridge',
  'R-Warriors',
  'Kingdom Woman',
  'R-Worship',
  'Media Team',
  'Intercessors',
  'Evangelists',
  'Hospitality',
  'Care & Counselling',
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SuggestionsPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [type,        setType]        = useState<SubmissionType>('suggestion');
  const [subject,     setSubject]     = useState('');
  const [details,     setDetails]     = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [department,  setDepartment]  = useState('general');
  const [submitted,   setSubmitted]   = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    db.from('suggestions')
      .select('id, type, subject, message, status, created_at, is_anonymous')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }: { data: any }) => setSubmissions((data ?? []) as Submission[]));
  }, [profile?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;
    setIsLoading(true);

    const { data: newSub } = await db.from('suggestions').insert({
      user_id:      profile?.id ?? null,
      is_anonymous: isAnonymous,
      type,
      category:     department,
      subject:      subject.trim(),
      message:      details.trim(),
    }).select('id, type, subject, message, status, created_at, is_anonymous').single();

    if (newSub) setSubmissions(prev => [newSub as Submission, ...prev]);
    setSubmitted(true);
    setIsLoading(false);
    setSubject('');
    setDetails('');
    setIsAnonymous(false);
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
            <h1 className="font-black text-gray-900 dark:text-white text-base tracking-tight leading-tight">Share Your Thoughts</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Your feedback helps us serve you better</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">

        {/* ── Form ─────────────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">

          {submitted ? (
            <div className="alert alert-success animate-fade-in-scale">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800 dark:text-green-300">Thank you for sharing!</p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                  Your {type} has been received. Our team will review it and follow up if needed.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-sm font-semibold text-green-700 dark:text-green-400 underline"
                >
                  Submit another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Type Selector */}
              <div>
                <label className="form-label">Type</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {SUBMISSION_TYPES.map(t => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setType(t.value as SubmissionType)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                        type === t.value
                          ? TYPE_ACTIVE[t.value as SubmissionType]
                          : `${TYPE_COLORS[t.value as SubmissionType]} hover:opacity-80`
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Submit anonymously</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your name will not be shared with the team</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(a => !a)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    isAnonymous ? 'bg-[#BF0A30]' : 'bg-gray-300 dark:bg-[#3D3D3D]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isAnonymous ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>


              {/* Subject */}
              <div className="form-group !mb-0">
                <label className="form-label">Subject <span className="required">*</span></label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Briefly describe your topic"
                  className="input"
                  required
                />
              </div>

              {/* Details */}
              <div className="form-group !mb-0">
                <label className="form-label">Details <span className="required">*</span></label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Share more about your suggestion, feedback, or concern..."
                  rows={4}
                  className="textarea"
                  required
                  minLength={10}
                />
                <span className="form-help">{details.length} characters — minimum 10</span>
              </div>

              {/* Category */}
              <div className="form-group !mb-0">
                <label className="form-label">Area <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="select">
                  <option value="general">General</option>
                  <option value="crosspoint">Crosspoint</option>
                  <option value="service">Sunday Service</option>
                  <option value="department">Ministry Department</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!subject.trim() || !details.trim() || details.length < 10 || isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Send className="w-4 h-4" />Submit {SUBMISSION_TYPES.find(t => t.value === type)?.label}</>
                }
              </button>
            </form>
          )}
        </div>

        {/* ── Previous Submissions ─────────────────────────────────────────────── */}
        {submissions.length > 0 && (
          <div>
            <h2 className="section-title mb-3">Your Previous Submissions</h2>
            <div className="space-y-3">
              {submissions.map(sub => {
                const statusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG['pending'];
                const StatusIcon = statusCfg.icon;
                const typeKey = sub.type as SubmissionType;

                return (
                  <div key={sub.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TYPE_COLORS[typeKey] ?? ''}`}>
                          {sub.type}
                        </span>
                        {sub.is_anonymous && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2D2D2D] text-gray-500 border border-gray-200 dark:border-[#3D3D3D]">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 ${statusCfg.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${statusCfg.color}`} />
                        <span className={`text-[10px] font-bold capitalize ${statusCfg.color}`}>{sub.status}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mt-3">{sub.subject}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{sub.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(sub.created_at)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
