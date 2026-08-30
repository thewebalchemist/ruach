// pages/member/onboarding.tsx
// 6-step onboarding wizard for new members after Connect graduation

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  CheckCircle, ChevronRight, ChevronLeft, Loader2,
  GraduationCap, BookOpen, Home, User, Star, MessageSquare,
  Phone, Mail, Search, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const H     = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const TOTAL = 6;

// ── Shared input style ────────────────────────────────────────────────────────
const inp = 'w-full px-4 py-3 bg-white/[0.05] border border-white/[0.10] rounded-2xl text-white placeholder-white/25 focus:outline-none focus:border-[#BF0A30] transition-colors text-sm';
const lbl = 'block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5';

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const icons = [GraduationCap, BookOpen, BookOpen, Home, User, Star];
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {Array.from({ length: TOTAL }, (_, i) => {
        const Icon = icons[i];
        const done = i < current - 1;
        const active = i === current - 1;
        return (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              done   ? 'bg-green-500 text-white' :
              active ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.06] text-white/25'
            }`}>
              {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            {i < TOTAL - 1 && (
              <div className={`w-6 h-0.5 mx-0.5 transition-colors ${i < current - 1 ? 'bg-green-500/50' : 'bg-white/[0.07]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Rating component ──────────────────────────────────────────────────────────
function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <p className={lbl}>{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(n)} type="button"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              n <= value ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/25 hover:bg-white/[0.09]'
            }`}>
            <Star className={`w-5 h-5 ${n <= value ? 'fill-white' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MemberOnboarding() {
  const router = useRouter();
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Welcome
  const [hasDoneConnect, setHasDoneConnect] = useState<boolean | null>(null);

  // Step 2: Connect cohort
  const [cohorts, setCohorts]         = useState<{ id: string; name: string }[]>([]);
  const [cohortId, setCohortId]       = useState('');
  const [cohortYear, setCohortYear]   = useState('');
  const [isLegacy, setIsLegacy]       = useState(false);

  // Step 3: Discipleship
  const [hasDoneKDC, setHasDoneKDC]   = useState<boolean | null>(null);
  const [kdcIntent, setKdcIntent]     = useState(false);
  const [kdcLevel, setKdcLevel]       = useState<1|2|3>(1);
  const [kdcCohortId, setKdcCohortId] = useState('');
  const [kdcCohorts, setKdcCohorts]   = useState<{ id: string; name: string }[]>([]);
  const [kdcYear, setKdcYear]         = useState('');

  // Step 4: Crosspoint
  const [crosspoints, setCrosspoints] = useState<{ id: string; name: string; zone: string; location: string }[]>([]);
  const [cpSearch, setCpSearch]       = useState('');
  const [cpId, setCpId]               = useState('');
  const [wantCrosspoint, setWantCrosspoint] = useState<boolean | null>(null);

  // Step 5: Personal details
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [phone, setPhone]             = useState('');
  const [otpPref, setOtpPref]         = useState<'sms' | 'email'>('sms');

  // Step 6: Feedback
  const [teachScore, setTeachScore]   = useState(0);
  const [worScore, setWorScore]       = useState(0);
  const [comScore, setComScore]       = useState(0);
  const [comments, setComments]       = useState('');

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Pre-fill from profile
    if (profile) {
      setFirstName((profile as any).first_name ?? '');
      setLastName((profile as any).last_name ?? '');
      setPhone((profile as any).phone ?? '');
    }
  }, [profile]);

  useEffect(() => {
    supabase.from('connect_cohorts').select('id, name').order('created_at', { ascending: false })
      .then(({ data }) => setCohorts(data ?? []));
  }, []);

  useEffect(() => {
    if (step === 3) {
      supabase.from('discipleship_cohorts').select('id, name').order('created_at', { ascending: false })
        .then(({ data }) => setKdcCohorts(data ?? []));
    }
    if (step === 4) {
      supabase.from('crosspoints').select('id, name, zone, location').order('zone')
        .then(({ data }) => setCrosspoints(data ?? []));
    }
  }, [step]);

  const filteredCps = crosspoints.filter(cp =>
    cp.name.toLowerCase().includes(cpSearch.toLowerCase()) ||
    cp.zone.toLowerCase().includes(cpSearch.toLowerCase()) ||
    (cp.location ?? '').toLowerCase().includes(cpSearch.toLowerCase())
  );

  // ── Navigation ──────────────────────────────────────────────────────────────
  const next = () => { setError(''); setStep(s => Math.min(TOTAL, s + 1)); };
  const prev = () => { setError(''); setStep(s => Math.max(1, s - 1)); };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleFinish = useCallback(async () => {
    if (!profile?.id) return;
    setSaving(true);
    setError('');

    try {
      // 1. Update profile details
      const profileUpdate: Record<string, unknown> = {
        first_name:        firstName.trim(),
        last_name:         lastName.trim(),
        phone:             phone.trim() || null,
        otp_preference:    otpPref,
        onboarding_complete: true,
        last_feedback_at:  teachScore > 0 ? new Date().toISOString() : undefined,
        discipleship_intent: kdcIntent,
      };

      const { error: profileErr } = await supabase.from('profiles').update(profileUpdate).eq('id', profile.id);
      if (profileErr) throw new Error(profileErr.message);

      // 2. Connect cohort record — via a SECURITY DEFINER RPC rather than a
      // direct upsert: connect_students_update RLS is staff-only, so the
      // ON CONFLICT DO UPDATE arm of a plain client upsert would be silently
      // rejected if this member already has a row for the cohort (e.g. a
      // second run of onboarding). The RPC also generates a real
      // admission_number (NOT NULL, no default) and hard-codes the only
      // self-declarable status ('completed' — there is no 'graduated' value).
      if (cohortId && !isLegacy) {
        await supabase.rpc('connect_students_self_upsert', { p_cohort_id: cohortId });
      } else if (isLegacy && cohortYear) {
        // Legacy member request — plain insert (no unique constraint on
        // user_id exists on this table, matching how register.tsx does it).
        // full_name/email/phone/cohort_attended/years_as_member/branch are
        // all NOT NULL on this table; the wizard only ever collects a year,
        // so the rest are filled from data already gathered in step 5 or
        // the same 'ruach-tabernacle' default register.tsx's branch picker uses.
        const yearJoinedNum = parseInt(cohortYear, 10) || new Date().getFullYear();
        await supabase.from('legacy_member_requests').insert({
          user_id:         profile.id,
          full_name:       `${firstName} ${lastName}`.trim(),
          email:           (profile as any)?.email ?? '',
          phone:           phone.trim(),
          cohort_attended: cohortYear,
          year_joined:     yearJoinedNum,
          years_as_member: Math.max(0, new Date().getFullYear() - yearJoinedNum),
          branch:          'ruach-tabernacle',
          status:          'pending',
        });
      }

      // 3. Discipleship intent — same RPC pattern as step 2 (admission_number
      // is NOT NULL with no default; UPDATE RLS is staff-only).
      if (hasDoneKDC && kdcCohortId) {
        await supabase.rpc('discipleship_students_self_upsert', { p_cohort_id: kdcCohortId, p_level: kdcLevel });
      }

      // 4. Crosspoint membership — same RPC pattern (crosspoint_memberships
      // UPDATE RLS is staff-only, so a repeat run or a previously-left
      // membership's UPDATE arm would otherwise be silently rejected).
      if (wantCrosspoint && cpId) {
        await supabase.rpc('crosspoint_memberships_self_upsert', { p_crosspoint_id: cpId });
      }

      // 5. Feedback survey
      if (teachScore > 0 && worScore > 0 && comScore > 0) {
        await supabase.from('member_feedback').insert({
          user_id:          profile.id,
          teachings_score:  teachScore,
          worship_score:    worScore,
          community_score:  comScore,
          comments:         comments.trim() || null,
        });
      }

      // 6. Welcome notification
      await supabase.from('notifications').insert({
        user_id:    profile.id,
        type:       'system',
        title:      'Welcome to Ruach!',
        body:       'Your membership profile is complete. Welcome to the Ruach family!',
        action_url: '/member',
      });

      router.push('/member');
    } catch (e: unknown) {
      setError((e as Error).message);
      setSaving(false);
    }
  }, [profile, firstName, lastName, phone, otpPref, cohortId, isLegacy, cohortYear, hasDoneKDC, kdcCohortId, kdcLevel, wantCrosspoint, cpId, teachScore, worScore, comScore, comments, kdcIntent, router]);

  // ── Step renders ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#BF0A30] mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-white text-2xl mb-1" style={H}>Member Onboarding</h1>
            <p className="text-white/35 text-sm">Step {step} of {TOTAL}</p>
          </div>

          <Steps current={step} />

          {/* Step cards */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 md:p-8">

            {/* ─ Step 1: Welcome ─ */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white text-xl mb-1" style={H}>Welcome to Ruach</h2>
                  <p className="text-white/40 text-sm">This quick setup helps us personalise your membership experience.</p>
                </div>
                <div>
                  <p className={lbl}>Have you completed Connect Class?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[true, false].map(v => (
                      <button key={String(v)} onClick={() => setHasDoneConnect(v)}
                        className={`py-3 rounded-2xl text-sm font-bold transition-colors ${
                          hasDoneConnect === v ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.09]'
                        }`} style={H}>
                        {v ? 'Yes' : 'Not yet'}
                      </button>
                    ))}
                  </div>
                  {hasDoneConnect === false && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                      <p className="text-amber-300 text-sm">Connect Class is the first step to full membership. <a href="/connect/register" className="underline">Register for a cohort →</a></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─ Step 2: Connect cohort ─ */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-white text-xl mb-1" style={H}>Your Connect Cohort</h2>
                  <p className="text-white/40 text-sm">Which Connect cohort did you attend?</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsLegacy(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${!isLegacy ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/50'}`} style={H}>
                    Select from list
                  </button>
                  <button onClick={() => setIsLegacy(true)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${isLegacy ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/50'}`} style={H}>
                    Older cohort / Legacy
                  </button>
                </div>
                {!isLegacy ? (
                  <div>
                    <label className={lbl}>Select your cohort</label>
                    <select value={cohortId} onChange={e => setCohortId(e.target.value)} className={inp}>
                      <option value="">— Choose a cohort —</option>
                      {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <p className="text-white/25 text-xs mt-2">Don't see yours? Switch to "Older cohort" mode.</p>
                  </div>
                ) : (
                  <div>
                    <label className={lbl}>Approximate year you attended</label>
                    <select value={cohortYear} onChange={e => setCohortYear(e.target.value)} className={inp}>
                      <option value="">— Select year —</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-blue-300 text-xs">Your account will be marked for admin verification. You'll still have full access while it's being reviewed.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─ Step 3: Discipleship ─ */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-white text-xl mb-1" style={H}>Discipleship (KDC)</h2>
                  <p className="text-white/40 text-sm">Have you done Kingdom Discipleship Class?</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    [true,  'Yes, I have'],
                    [false, 'Not yet'],
                    ['intent', 'I want to'],
                  ] as [boolean | string, string][]).map(([v, label]) => (
                    <button key={String(v)} onClick={() => {
                      if (v === 'intent') { setHasDoneKDC(false); setKdcIntent(true); }
                      else { setHasDoneKDC(v as boolean); setKdcIntent(false); }
                    }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        (v === 'intent' ? kdcIntent : hasDoneKDC === v) ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.09]'
                      }`} style={H}>
                      {label}
                    </button>
                  ))}
                </div>
                {hasDoneKDC && (
                  <div className="space-y-4">
                    <div>
                      <label className={lbl}>Level completed</label>
                      <div className="flex gap-2">
                        {([1, 2, 3] as const).map(l => (
                          <button key={l} onClick={() => setKdcLevel(l)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${kdcLevel === l ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/50'}`} style={H}>
                            KDC {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    {kdcCohorts.length > 0 ? (
                      <div>
                        <label className={lbl}>Your KDC cohort (optional)</label>
                        <select value={kdcCohortId} onChange={e => setKdcCohortId(e.target.value)} className={inp}>
                          <option value="">— Select cohort —</option>
                          {kdcCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className={lbl}>Approximate year (if cohort not listed)</label>
                        <input value={kdcYear} onChange={e => setKdcYear(e.target.value)} placeholder="e.g. 2023" className={inp} />
                      </div>
                    )}
                  </div>
                )}
                {kdcIntent && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-300 text-xs">Great! We'll add you to the discipleship interest list and notify you when the next KDC cohort opens.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─ Step 4: Crosspoint ─ */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-white text-xl mb-1" style={H}>Crosspoint Home Church</h2>
                  <p className="text-white/40 text-sm">Crosspoints are small home churches that meet weekly in your neighbourhood.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    [true,  'I\'m in one'],
                    [false, 'Skip for now'],
                    ['want', 'I want to join'],
                  ] as [boolean | string, string][]).map(([v, label]) => (
                    <button key={String(v)} onClick={() => setWantCrosspoint(v === 'want' ? true : v as boolean)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        wantCrosspoint === v || (v === 'want' && wantCrosspoint === true && !cpId) ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.09]'
                      }`} style={H}>
                      {label}
                    </button>
                  ))}
                </div>
                {wantCrosspoint && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                      <input value={cpSearch} onChange={e => setCpSearch(e.target.value)} placeholder="Search by name, zone or area…"
                        className={inp + ' pl-10'} />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredCps.length === 0 && <p className="text-white/25 text-sm text-center py-4">No crosspoints found</p>}
                      {filteredCps.map(cp => (
                        <button key={cp.id} onClick={() => setCpId(cp.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                            cpId === cp.id ? 'bg-[#BF0A30]/20 border border-[#BF0A30]/40' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07]'
                          }`}>
                          <Home className={`w-4 h-4 flex-shrink-0 ${cpId === cp.id ? 'text-[#BF0A30]' : 'text-white/25'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-bold truncate" style={H}>{cp.name}</p>
                            <p className="text-white/35 text-xs">{cp.zone} · {cp.location}</p>
                          </div>
                          {cpId === cp.id && <CheckCircle className="w-4 h-4 text-[#BF0A30] flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─ Step 5: Personal Details ─ */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-white text-xl mb-1" style={H}>Your Details</h2>
                  <p className="text-white/40 text-sm">Help us know who you are.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>First name</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Last name</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className={inp} />
                  </div>
                </div>
                <div>
                  <label className={lbl}><Phone className="inline w-3 h-3 mr-1" />WhatsApp number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" type="tel" className={inp} />
                </div>
                <div>
                  <label className={lbl}><Mail className="inline w-3 h-3 mr-1" />OTP login preference</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['sms', 'email'] as const).map(p => (
                      <button key={p} onClick={() => setOtpPref(p)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${otpPref === p ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.09]'}`} style={H}>
                        {p === 'sms' ? 'SMS (Phone)' : 'Email'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─ Step 6: Feedback ─ */}
            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-white text-xl mb-1" style={H}>Quick Feedback</h2>
                  <p className="text-white/40 text-sm">Help us serve you better. This takes 30 seconds.</p>
                </div>
                <StarRating value={teachScore} onChange={setTeachScore} label="Teachings" />
                <StarRating value={worScore}   onChange={setWorScore}   label="Worship" />
                <StarRating value={comScore}   onChange={setComScore}   label="Community" />
                <div>
                  <label className={lbl}><MessageSquare className="inline w-3 h-3 mr-1" />Comments (optional)</label>
                  <textarea value={comments} onChange={e => setComments(e.target.value)}
                    rows={3} placeholder="Share any thoughts, suggestions or encouragements…"
                    className={inp + ' resize-none'} />
                </div>
                <p className="text-white/20 text-xs">You can skip this step — we just appreciate your input.</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button onClick={prev} className="flex items-center gap-1.5 px-4 py-2.5 border border-white/[0.08] rounded-2xl text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < TOTAL ? (
                <button onClick={() => {
                  // Step 1: if answered No to Connect, redirect
                  if (step === 1 && hasDoneConnect === false) {
                    router.push('/connect/register');
                    return;
                  }
                  next();
                }}
                  disabled={step === 1 && hasDoneConnect === null}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#BF0A30] hover:bg-[#A0021F] disabled:opacity-40 text-white rounded-2xl text-sm font-black transition-colors"
                  style={H}>
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#BF0A30] hover:bg-[#A0021F] disabled:opacity-60 text-white rounded-2xl text-sm font-black transition-colors shadow-lg shadow-[#BF0A30]/20"
                  style={H}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Complete Setup'}
                </button>
              )}
            </div>

            {/* Skip feedback on step 6 */}
            {step === TOTAL && (
              <button onClick={handleFinish} disabled={saving}
                className="w-full mt-2 py-2 text-white/25 text-xs hover:text-white/40 transition-colors">
                Skip feedback & finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
