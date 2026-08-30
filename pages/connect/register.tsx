// pages/connect/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Step = 1 | 2 | 3;
type Mode = 'new' | 'legacy';

interface CohortOption { id: string; name: string; year: number; start_date?: string; end_date?: string; }

interface FormData {
  firstName: string; lastName: string; email: string; phone: string;
  gender: string; dateOfBirth: string; address: string; occupation: string;
  maritalStatus: string; branch: string; crosspointZone: string;
  preferredClassType: string; acceptedJesus: string; cohortId: string;
  password: string; confirmPassword: string;
  cohortAttended: string; yearJoined: string; yearsAsMember: string; additionalInfo: string;
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '', gender: '', dateOfBirth: '',
  address: '', occupation: '', maritalStatus: '', branch: 'ruach-tabernacle',
  crosspointZone: '', preferredClassType: 'physical', acceptedJesus: 'yes',
  cohortId: '', password: '', confirmPassword: '',
  cohortAttended: '', yearJoined: '', yearsAsMember: '', additionalInfo: '',
};

// db is typed as any to bypass the never inference issue on insert/update/rpc
// until Supabase CLI-generated types are used instead of the hand-written ones
const db = supabase as any;

export default function ConnectRegister() {
  const router  = useRouter();
  const [mode,    setMode]    = useState<Mode>('new');
  const [step,    setStep]    = useState<Step>(1);
  const [form,    setForm]    = useState<FormData>(EMPTY);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<CohortOption | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState('');

  async function loadCohorts() {
    const { data } = await db.from('connect_cohorts')
      .select('id, name, year, start_date, end_date')
      .eq('status', 'registration-open')
      .order('start_date', { ascending: true });
    const mapped = (data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      year: c.year,
      start_date: c.start_date,
      end_date: c.end_date,
    }));
    setCohorts(mapped as CohortOption[]);
  }

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function validateStep(s: Step): string {
    if (s === 1) {
      if (!form.firstName.trim()) return 'First name is required.';
      if (!form.lastName.trim())  return 'Last name is required.';
      if (!form.email.trim())     return 'Email is required.';
      if (!form.phone.trim())     return 'Phone number is required.';
      if (!form.gender)           return 'Please select your gender.';
    }
    if (s === 2) {
      if (!form.branch) return 'Please select your branch.';
    }
    if (s === 3 && mode === 'new') {
      if (!form.cohortId)                         return 'Please select a cohort.';
      if (form.password.length < 8)               return 'Password must be at least 8 characters.';
      if (form.password !== form.confirmPassword)  return 'Passwords do not match.';
    }
    return '';
  }

  async function handleNext() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    if (step < 3) {
      if (step === 2) await loadCohorts();
      setStep((step + 1) as Step);
    } else {
      await handleSubmit();
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    if (mode === 'legacy') {
      await submitLegacy();
    } else {
      await submitNew();
    }
    setLoading(false);
  }

  async function submitNew() {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name:  form.lastName,
          full_name:  `${form.firstName} ${form.lastName}`,
          phone:      form.phone,
          role:       'student',
          branch:     form.branch,
        },
      },
    });

    if (authErr || !authData.user) {
      setError(authErr?.message ?? 'Registration failed. Please try again.');
      return;
    }

    const userId = authData.user.id;

    // Update profile — use db (any-typed) to bypass never inference
    await db.from('profiles').update({
      phone:           form.phone || null,
      gender:          form.gender || null,
      date_of_birth:   form.dateOfBirth || null,
      address:         form.address || null,
      occupation:      form.occupation || null,
      marital_status:  form.maritalStatus || null,
      branch:          form.branch,
      crosspoint_zone: form.crosspointZone || null,
    }).eq('id', userId);

    const year = new Date().getFullYear();
    const { data: admissionNum } = await db.rpc(
      'generate_connect_admission_number',
      { p_year: year }
    );

    const { error: enrollErr } = await db.from('connect_students').insert({
      user_id:              userId,
      cohort_id:            form.cohortId,
      admission_number:     (admissionNum as string | null) ?? `CC-${year}-000`,
      preferred_class_type: form.preferredClassType,
      accepted_jesus:       form.acceptedJesus,
      status:               'enrolled',
    });

    if (enrollErr) {
      setError('Enrollment failed: ' + enrollErr.message);
      return;
    }

    await fetch('/api/email/connect-registration', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId }),
    });

    setRegisteredEmail(form.email);
    setSelectedCohort(cohorts.find(c => c.id === form.cohortId) || null);
    setSuccess(true);
  }

  async function submitLegacy() {
    if (!form.firstName || !form.email || !form.phone || !form.cohortAttended || !form.yearJoined) {
      setError('Please fill in all required fields.');
      return;
    }

    const { error: legacyErr } = await db.from('legacy_member_requests').insert({
      full_name:       `${form.firstName} ${form.lastName}`.trim(),
      email:           form.email,
      phone:           form.phone,
      cohort_attended: form.cohortAttended,
      year_joined:     parseInt(form.yearJoined) || 0,
      years_as_member: parseInt(form.yearsAsMember) || 0,
      branch:          form.branch,
      crosspoint_zone: form.crosspointZone || null,
      additional_info: form.additionalInfo || null,
      status:          'pending',
    });

    if (legacyErr) { setError(legacyErr.message); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F] p-6">
        <div className="max-w-lg w-full">
          {/* Success card */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-[#2A2A2A] p-8 text-center shadow-xl">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {mode === 'new' ? 'You\'re registered!' : 'Request Submitted!'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
              {mode === 'new'
                ? `Welcome to Ruach Tabernacle! We've sent your admission details to ${registeredEmail}.`
                : 'Your legacy member request has been submitted. Our admin team will review and contact you within 3–5 business days.'}
            </p>

            {mode === 'new' && selectedCohort && (
              <div className="bg-[#BF0A30]/6 dark:bg-[#BF0A30]/12 border border-[#BF0A30]/15 rounded-2xl p-5 mb-6 text-left">
                <p className="text-xs font-bold text-[#BF0A30] uppercase tracking-wider mb-3">Your Connect Cohort</p>
                <p className="font-bold text-gray-900 dark:text-white mb-2">{selectedCohort.name}</p>
                {selectedCohort.start_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="text-gray-400">Starts:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedCohort.start_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {selectedCohort.end_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="text-gray-400">Ends:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedCohort.end_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {mode === 'new' && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">How to sign in</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Use your <strong>phone number (OTP)</strong> or your <strong>email + password</strong> you just set to log in at the Connect portal.
                </p>
              </div>
            )}

            <Link
              href="/connect"
              className="block w-full py-3 px-8 bg-[#BF0A30] hover:bg-[#A00828] text-white rounded-2xl font-bold transition-colors"
            >
              Sign In to Connect Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0F0F0F]">
      <div
        className="hidden lg:flex lg:w-[40%] flex-col justify-center items-center p-12 relative"
        style={{ backgroundImage: "url('/images/connect-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#BF0A30]/90 via-[#8B0000]/85 to-black/80" />
        <div className="relative z-10 text-center">
          <img src="/brand/ruach-logo.png" alt="Ruach" className="w-16 h-16 rounded-full mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Join Connect Class</h1>
          <p className="text-white/70">Begin your journey with Ruach Assemblies</p>
          {mode === 'new' && (
            <div className="mt-12 space-y-3">
              {[1, 2, 3].map(s => (
                <div key={s} className={`flex items-center gap-3 text-left ${step >= s ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    step > s ? 'bg-green-500 text-white' : step === s ? 'bg-white text-[#BF0A30]' : 'bg-white/20 text-white'
                  }`}>{step > s ? '✓' : s}</div>
                  <span className="text-white text-sm">
                    {s === 1 ? 'Personal Details' : s === 2 ? 'Church Info' : 'Class Preferences'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex items-start justify-center p-8">
        <div className="w-full max-w-lg py-4">
          <div className="flex items-center justify-between mb-8">
            <Link href="/connect" className="flex items-center gap-2 text-gray-500 hover:text-[#BF0A30] text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
            <div className="flex bg-gray-100 dark:bg-[#1A1A1A] rounded-xl p-1">
              {(['new', 'legacy'] as Mode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setStep(1); }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === m ? 'bg-white dark:bg-[#2D2D2D] text-[#BF0A30] shadow-sm' : 'text-gray-500'
                  }`}>
                  {m === 'new' ? 'New Registration' : 'Legacy Member'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'legacy' ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Legacy Member Request</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                Already completed Connect Class before this system? Submit a verification request.
              </p>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>First Name *</label><input value={form.firstName} onChange={e => set('firstName', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Last Name *</label><input value={form.lastName} onChange={e => set('lastName', e.target.value)} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Phone *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Cohort / Class Attended *</label><input placeholder="e.g. Connect Class 2019 Batch 2" value={form.cohortAttended} onChange={e => set('cohortAttended', e.target.value)} className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Year Joined *</label><input type="number" min={2000} max={2025} value={form.yearJoined} onChange={e => set('yearJoined', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Years as Member</label><input type="number" min={0} value={form.yearsAsMember} onChange={e => set('yearsAsMember', e.target.value)} className={inputClass} /></div>
                </div>
                <div>
                  <label className={labelClass}>Branch</label>
                  <select value={form.branch} onChange={e => set('branch', e.target.value)} className={inputClass}>
                    <option value="ruach-tabernacle">Ruach Tabernacle</option>
                    <option value="ruach-east">Ruach East</option>
                    <option value="ruach-west">Ruach West</option>
                    <option value="ruach-south">Ruach South</option>
                    <option value="ruach-rivers">Ruach Rivers</option>
                  </select>
                </div>
                <div><label className={labelClass}>Additional Information</label>
                  <textarea rows={3} value={form.additionalInfo} onChange={e => set('additionalInfo', e.target.value)}
                    placeholder="Any other details to help verification..." className={inputClass + ' resize-none'} />
                </div>
                {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"><p className="text-red-600 text-sm">{error}</p></div>}
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full py-3 bg-[#BF0A30] hover:bg-[#B00325] disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Step {step} of 3 — {step === 1 ? 'Personal Details' : step === 2 ? 'Church Information' : 'Class Preferences'}
              </h2>
              <div className="flex gap-2 mb-8">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-[#BF0A30]' : 'bg-gray-200 dark:bg-[#2D2D2D]'}`} />
                ))}
              </div>

              <div className="space-y-5">
                {step === 1 && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>First Name *</label><input value={form.firstName} onChange={e => set('firstName', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Last Name *</label><input value={form.lastName} onChange={e => set('lastName', e.target.value)} className={inputClass} /></div>
                  </div>
                  <div><label className={labelClass}>Email Address *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Phone Number *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254..." className={inputClass} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Gender *</label>
                      <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputClass}>
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div><label className={labelClass}>Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputClass} /></div>
                  </div>
                </>)}

                {step === 2 && (<>
                  <div>
                    <label className={labelClass}>Branch *</label>
                    <select value={form.branch} onChange={e => set('branch', e.target.value)} className={inputClass}>
                      <option value="ruach-tabernacle">Ruach Tabernacle</option>
                      <option value="ruach-east">Ruach East</option>
                      <option value="ruach-west">Ruach West</option>
                      <option value="ruach-south">Ruach South</option>
                      <option value="ruach-rivers">Ruach Rivers</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Crosspoint Zone</label>
                    <select value={form.crosspointZone} onChange={e => set('crosspointZone', e.target.value)} className={inputClass}>
                      <option value="">Select area...</option>
                      <option value="south">South</option>
                      <option value="east">East</option>
                      <option value="north">North</option>
                      <option value="west">West</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Address / Area</label><input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Neighbourhood, Nairobi" className={inputClass} /></div>
                  <div><label className={labelClass}>Occupation</label><input value={form.occupation} onChange={e => set('occupation', e.target.value)} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select value={form.maritalStatus} onChange={e => set('maritalStatus', e.target.value)} className={inputClass}>
                      <option value="">Select...</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>
                </>)}

                {step === 3 && (<>
                  <div>
                    <label className={labelClass}>Select Cohort *</label>
                    {cohorts.length === 0 ? (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-4">
                        <p className="text-amber-700 dark:text-amber-300 text-sm font-semibold mb-1">No cohorts open for registration</p>
                        <p className="text-amber-600 dark:text-amber-400 text-xs">Check back soon or contact us to find out when the next Connect Class opens.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cohorts.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => set('cohortId', c.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              form.cohortId === c.id
                                ? 'border-[#BF0A30] bg-[#BF0A30]/5'
                                : 'border-gray-200 dark:border-[#2D2D2D] hover:border-gray-300 dark:hover:border-[#3D3D3D]'
                            }`}
                          >
                            <p className={`font-semibold text-sm ${form.cohortId === c.id ? 'text-[#BF0A30]' : 'text-gray-900 dark:text-white'}`}>{c.name}</p>
                            {c.start_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                Starts {new Date(c.start_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                {c.end_date ? ` · Ends ${new Date(c.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` : ''}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Preferred Class Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[['physical', '🏛️ Physical'], ['virtual', '💻 Virtual']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => set('preferredClassType', v)}
                          className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            form.preferredClassType === v ? 'border-[#BF0A30] bg-[#BF0A30]/5 text-[#BF0A30]' : 'border-gray-200 dark:border-[#2D2D2D] text-gray-600 dark:text-gray-400'
                          }`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Have you accepted Jesus as Lord and Saviour?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[['yes', 'Yes'], ['no', 'No'], ['not-sure', 'Not Sure']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => set('acceptedJesus', v)}
                          className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            form.acceptedJesus === v ? 'border-[#BF0A30] bg-[#BF0A30]/5 text-[#BF0A30]' : 'border-gray-200 dark:border-[#2D2D2D] text-gray-600 dark:text-gray-400'
                          }`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Password *</label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 8 characters" className={inputClass + ' pr-12'} />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password *</label>
                    <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={inputClass} />
                  </div>
                </>)}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep((step - 1) as Step)}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-[#2D2D2D] rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:border-[#BF0A30] hover:text-[#BF0A30]">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <button type="button" onClick={handleNext} disabled={loading || (step === 3 && cohorts.length === 0)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#BF0A30] hover:bg-[#B00325] disabled:opacity-60 text-white font-semibold rounded-xl">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      : step < 3 ? <><span>Continue</span><ArrowRight className="w-4 h-4" /></> : 'Complete Registration'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
            Already registered?{' '}
            <Link href="/connect" className="text-[#BF0A30] font-semibold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}