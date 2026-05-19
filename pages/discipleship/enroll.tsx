// pages/discipleship/enroll.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface ExistingEnrollment { level: 1 | 2 | 3; status: string; }
interface CohortRow {
  id: string; name: string; level: 1 | 2 | 3; year: number;
  start_date: string; schedule: string; enrolled_count: number;
  max_capacity: number; registration_deadline: string;
}

// db typed as any to bypass never inference on insert/rpc
const db = supabase as any;

export default function DiscipleshipEnroll() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [cohorts,           setCohorts]       = useState<CohortRow[]>([]);
  const [selectedLevel,     setSelectedLevel] = useState<1 | 2 | 3 | null>(null);
  const [selectedId,        setSelectedId]    = useState('');
  const [completedLevels,   setCompleted]     = useState<number[]>([]);
  const [activeEnrollments, setActive]        = useState<number[]>([]);
  const [loading,           setLoading]       = useState(true);
  const [submitting,        setSubmitting]    = useState(false);
  const [error,             setError]         = useState('');
  const [success,           setSuccess]       = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/connect'); return; }

    const memberRoles = ['member', 'leader', 'teacher', 'admin', 'pastor'];
    if (!memberRoles.includes(profile.role)) { router.push('/member'); return; }

    async function load() {
      const { data: existing } = await db
        .from('discipleship_students')
        .select('level, status')
        .eq('user_id', profile!.id);

      const rows = (existing ?? []) as ExistingEnrollment[];
      const completed = rows.filter(e => e.status === 'completed').map(e => e.level);
      const active    = rows.filter(e => ['enrolled', 'in-progress'].includes(e.status)).map(e => e.level);
      setCompleted(completed);
      setActive(active);

      const nextLevel: 1 | 2 | 3 | null =
        completed.includes(3) ? null :
        completed.includes(2) ? 3 :
        completed.includes(1) ? 2 : 1;
      if (nextLevel) setSelectedLevel(nextLevel);

      const { data: cohortData } = await db
        .from('discipleship_cohorts')
        .select('id, name, level, year, start_date, schedule, enrolled_count, max_capacity, registration_deadline')
        .eq('status', 'registration-open')
        .order('level')
        .order('start_date');

      setCohorts((cohortData ?? []) as CohortRow[]);
      setLoading(false);
    }

    load();
  }, [profile, authLoading, router]);

  async function handleEnroll() {
    if (!selectedId || !selectedLevel) return;
    setSubmitting(true);
    setError('');

    const year = new Date().getFullYear();
    const { data: admissionNum } = await db.rpc(
      'generate_discipleship_admission_number',
      { p_year: year }
    );

    const { error: enrollErr } = await db.from('discipleship_students').insert({
      user_id:          profile!.id,
      cohort_id:        selectedId,
      level:            selectedLevel,
      admission_number: (admissionNum as string | null) ?? `KDC-${year}-000`,
      status:           'enrolled',
    });

    if (enrollErr) { setError(enrollErr.message); setSubmitting(false); return; }

    await fetch('/api/email/discipleship-enrollment', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId: profile!.id, cohortId: selectedId }),
    });

    setSuccess(true);
    setSubmitting(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F]">
        <Loader2 className="w-8 h-8 animate-spin text-[#BF0A30]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F] p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Enrolled Successfully!</h1>
          <p className="text-gray-500 mb-8">Check your email for enrollment confirmation and class details.</p>
          <Link href="/discipleship/student" className="inline-block py-3 px-8 bg-[#BF0A30] text-white rounded-xl font-semibold hover:bg-[#B00325]">
            Go to Discipleship Portal
          </Link>
        </div>
      </div>
    );
  }

  const LEVELS: { level: 1 | 2 | 3; title: string }[] = [
    { level: 1, title: 'Level 1 — Foundations' },
    { level: 2, title: 'Level 2 — Growing in Grace' },
    { level: 3, title: 'Level 3 — Leadership' },
  ];

  const levelCohorts = cohorts.filter(c => c.level === selectedLevel);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
      <header className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2D2D2D]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/member" className="flex items-center gap-2 text-gray-500 hover:text-[#BF0A30] text-sm">
            <ArrowLeft className="w-4 h-4" /> Member Dashboard
          </Link>
          <span className="text-gray-300 dark:text-[#3D3D3D]">/</span>
          <span className="text-gray-900 dark:text-white font-semibold text-sm">Discipleship Enrollment</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Kingdom Discipleship Classes</h1>
          <p className="text-gray-500">A 3-level programme to deepen your faith, character, and calling.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map(({ level, title }) => {
            const isCompleted = completedLevels.includes(level);
            const isActive    = activeEnrollments.includes(level);
            const isLocked    = level > 1 && !completedLevels.includes(level - 1);
            const isSelected  = selectedLevel === level;
            return (
              <button key={level} onClick={() => !isLocked && setSelectedLevel(level)} disabled={isLocked}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected  ? 'border-[#BF0A30] bg-[#BF0A30]/5' :
                  isCompleted ? 'border-green-300 bg-green-50 dark:bg-green-900/20' :
                  isLocked    ? 'border-gray-200 dark:border-[#2D2D2D] opacity-50 cursor-not-allowed' :
                  'border-gray-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] hover:border-[#BF0A30]'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">L{level}</span>
                  {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {isActive    && <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Active</span>}
                  {isLocked    && <span className="text-xs text-gray-400">🔒</span>}
                </div>
                <p className="text-xs text-gray-500 font-medium truncate">{title}</p>
              </button>
            );
          })}
        </div>

        {selectedLevel && activeEnrollments.includes(selectedLevel) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
              You are already enrolled in Level {selectedLevel}.
            </p>
            <Link href="/discipleship/student" className="inline-block mt-2 text-sm text-blue-700 underline">
              Go to Discipleship Portal →
            </Link>
          </div>
        )}

        {selectedLevel && !activeEnrollments.includes(selectedLevel) && !completedLevels.includes(selectedLevel) && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Level {selectedLevel} Cohorts
            </h2>

            {levelCohorts.length === 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-6 text-center">
                <GraduationCap className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-amber-700 dark:text-amber-300 font-medium">No open cohorts for Level {selectedLevel} right now.</p>
                <p className="text-amber-600 text-sm mt-1">Check back soon or contact discipleship@ruachtabernacle.org</p>
              </div>
            ) : (
              <div className="space-y-3">
                {levelCohorts.map(c => (
                  <button key={c.id} onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                      selectedId === c.id
                        ? 'border-[#BF0A30] bg-[#BF0A30]/5'
                        : 'border-gray-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] hover:border-[#BF0A30]'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                      <span className="text-xs text-gray-500">{c.enrolled_count}/{c.max_capacity} enrolled</span>
                    </div>
                    <p className="text-sm text-gray-500">{c.schedule}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Starts {new Date(c.start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long' })}
                      {' · '}Register by {new Date(c.registration_deadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Already completed Discipleship before this system?</p>
                  <Link href="/discipleship/legacy-request" className="text-sm text-[#BF0A30] hover:underline">Submit a verification request →</Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3 mt-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {selectedId && (
              <button onClick={handleEnroll} disabled={submitting}
                className="w-full mt-6 py-3.5 bg-[#BF0A30] hover:bg-[#B00325] disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</> : 'Confirm Enrollment'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}