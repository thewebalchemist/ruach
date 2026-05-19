// pages/discipleship/legacy-request.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Bypass never inference on insert
const db = supabase as any;

interface FormData {
  level: string;
  cohortName: string;
  yearCompleted: string;
  teacherName: string;
  additionalInfo: string;
}

const EMPTY: FormData = {
  level: '1',
  cohortName: '',
  yearCompleted: '',
  teacherName: '',
  additionalInfo: '',
};

export default function DiscipleshipLegacyRequest() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [form,      setForm]      = useState<FormData>(EMPTY);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.cohortName.trim() || !form.yearCompleted.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!profile) {
      setError('You must be signed in to submit a request.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: insertErr } = await db.from('discipleship_legacy_requests').insert({
      user_id:        profile.id,
      level:          parseInt(form.level),
      cohort_name:    form.cohortName.trim(),
      year_completed: parseInt(form.yearCompleted),
      teacher_name:   form.teacherName.trim() || null,
      additional_info: form.additionalInfo.trim() || null,
      status:         'pending',
    });

    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (authLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Request Submitted!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Our admin team will verify your Discipleship completion and update your profile within 3–5 business days.
            You'll receive a confirmation email once verified.
          </p>
          <Link href="/member" className="inline-block py-3 px-8 bg-[#BF0A30] text-white rounded-xl font-semibold hover:bg-[#B00325]">
            Back to Member Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
      <header className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2D2D2D]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/discipleship/enroll" className="flex items-center gap-2 text-gray-500 hover:text-[#BF0A30] text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Enrollment
          </Link>
          <span className="text-gray-300 dark:text-[#3D3D3D]">/</span>
          <span className="text-gray-900 dark:text-white font-semibold text-sm">Legacy Verification Request</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Legacy Discipleship Verification
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            If you completed Discipleship Classes before this system was set up, submit the details below.
            An admin will verify your record and add the badge to your profile.
          </p>

          <div className="space-y-6">
            <div>
              <label className={labelClass}>Level Completed *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['1', '2', '3'] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set('level', l)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.level === l
                        ? 'border-[#BF0A30] bg-[#BF0A30]/5 text-[#BF0A30]'
                        : 'border-gray-200 dark:border-[#2D2D2D] text-gray-600 dark:text-gray-400 hover:border-[#BF0A30]'
                    }`}
                  >
                    Level {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Cohort / Class Name *</label>
              <input
                value={form.cohortName}
                onChange={e => set('cohortName', e.target.value)}
                placeholder="e.g. KDC 2020 Level 1 Batch A"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Year Completed *</label>
              <input
                type="number"
                min={2000}
                max={new Date().getFullYear()}
                value={form.yearCompleted}
                onChange={e => set('yearCompleted', e.target.value)}
                placeholder="e.g. 2021"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Teacher / Facilitator Name</label>
              <input
                value={form.teacherName}
                onChange={e => set('teacherName', e.target.value)}
                placeholder="Name of the person who taught the class"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Additional Information</label>
              <textarea
                rows={4}
                value={form.additionalInfo}
                onChange={e => set('additionalInfo', e.target.value)}
                placeholder="Any other details that can help verify your completion — e.g. certificate number, fellow students, venue..."
                className={inputClass + ' resize-none'}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                <strong>Note:</strong> This request will be reviewed manually. You may be contacted for additional
                verification. Processing typically takes 3–5 business days.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 bg-[#BF0A30] hover:bg-[#B00325] disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : 'Submit Verification Request'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}