// pages/connect/index.tsx
// Connect Class portal — student and teacher login with OTP

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Loader2, Shield, ArrowLeft, ChevronRight, Mail,
  Eye, EyeOff, Heart, Zap, Users, FlaskConical
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useMode } from '@/context/ModeContext';

const MOCK_OTP = '123456';

type Step = 'role' | 'phone' | 'otp' | 'email-form';
type Tab  = 'student' | 'teacher';
interface ProfileResult { role: string; member_id: string | null; }

function formatKenyanPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('0') && d.length === 10) return '+254' + d.slice(1);
  if (d.startsWith('254') && d.length === 12) return '+' + d;
  if (d.startsWith('7') && d.length === 9) return '+254' + d;
  return raw;
}

function isValidPhone(phone: string): boolean {
  return /^\+254[17]\d{8}$/.test(phone);
}

export default function ConnectLogin() {
  const router = useRouter();
  const { isDemoMode, toggleMode } = useMode();

  const [tab,       setTab]       = useState<Tab>('student');
  const [step,      setStep]      = useState<Step>('role');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cdRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatted   = formatKenyanPhone(phone);
  const phoneValid  = isValidPhone(formatted);
  const otpComplete = otp.every(d => d);

  function startCountdown(secs = 60) {
    setCountdown(secs);
    if (cdRef.current) clearInterval(cdRef.current);
    cdRef.current = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(cdRef.current!); return 0; } return prev - 1; });
    }, 1000);
  }

  async function sendOtp() {
    if (!phoneValid) { setError('Please enter a valid Kenyan phone number'); return; }
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    if (!isDemoMode) {
      const { error: e } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (e) { setError(e.message); return; }
    }
    startCountdown(60); setStep('otp');
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every(d => d)) verifyOtp(next.join(''));
  }

  function handleOtpKey(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  async function verifyOtp(code: string) {
    setError(''); setLoading(true);
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
      if (code !== MOCK_OTP) {
        setError('Invalid code. Demo OTP is ' + MOCK_OTP);
        setOtp(['','','','','','']); otpRefs.current[0]?.focus(); return;
      }
      router.push(tab === 'teacher' ? '/connect/dashboard' : '/connect/student'); return;
    }
    const { data, error: e } = await supabase.auth.verifyOtp({ phone: formatted, token: code, type: 'sms' });
    if (e || !data.session) {
      setError(e?.message ?? 'Invalid OTP.');
      setOtp(['','','','','','']); otpRefs.current[0]?.focus(); setLoading(false); return;
    }
    await redirectByRole(data.session.user.id);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
      router.push(tab === 'teacher' ? '/connect/dashboard' : '/connect/student'); return;
    }
    const { data, error: ae } = await supabase.auth.signInWithPassword({ email, password });
    if (ae || !data.session) { setError(ae?.message ?? 'Invalid credentials.'); setLoading(false); return; }
    await redirectByRole(data.session.user.id);
  }

  async function redirectByRole(userId: string) {
    const { data: pd } = await supabase.from('profiles').select('role, member_id').eq('id', userId).single();
    const profile = pd as ProfileResult | null;
    const role    = profile?.role ?? '';
    if (tab === 'teacher') {
      if (!['teacher', 'admin', 'pastor', 'leader'].includes(role)) {
        setError('You do not have teacher access.'); await supabase.auth.signOut(); setLoading(false); return;
      }
      router.push('/connect/dashboard'); return;
    }
    if (['admin', 'pastor'].includes(role)) { router.push('/admin'); return; }
    if (['teacher', 'leader'].includes(role)) { router.push('/connect/dashboard'); return; }
    if (profile?.member_id) { router.push('/member'); return; }
    router.push('/connect/student');
  }

  function reset() { setStep('role'); setOtp(['','','','','','']); setError(''); setPhone(''); }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0A0A0A]">

      {/* ── Left branding panel ──────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundImage: "url('/images/connect-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Reduced opacity overlay so image shows through */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#BF0A30]/80 via-[#7D0018]/72 to-[#0A0005]/85" />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/images/ruaach.png" alt="Ruach" className="w-11 h-11 rounded-full ring-2 ring-white/20" />
          <div>
            <p className="text-white font-bold text-base">Ruach Assemblies</p>
            <p className="text-white/50 text-xs">Purpose Centre Church</p>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-6 tracking-tight">
            Begin Your<br />
            Journey of<br />
            Faith
          </h1>

          {/* Rev Julian Kyula */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 mb-8">
            <div className="w-full h-28 rounded-xl overflow-hidden mb-4 bg-white/5 border border-white/10">
              <img
                src="/images/rev-julian.jpg"
                alt="Rev. Julian Kyula"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <p className="text-white/90 text-sm italic leading-relaxed mb-3">
              "Connect Class is where your journey with Ruach begins. Here you will discover
              who you are in Christ and find your place in God's family. I am excited for you."
            </p>
            <p className="text-[#D4AF37] text-xs font-bold">Rev. Julian Kyula</p>
            <p className="text-white/50 text-xs">Visionary & Founder</p>
          </div>

          {/* God · Work · Community */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'God',       icon: Heart, desc: 'Faith first' },
              { label: 'Work',      icon: Zap,   desc: 'Your calling' },
              { label: 'Community', icon: Users, desc: 'Together' },
            ].map(({ label, icon: Icon, desc }) => (
              <div key={label} className="bg-white/10 backdrop-blur border border-white/15 rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-[#D4AF37] mx-auto mb-1.5" />
                <p className="text-white font-bold text-xs">{label}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">© 2026 Ruach Assemblies</p>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/images/ruaach.png" alt="Ruach" className="w-9 h-9 rounded-full" />
            <span className="font-bold text-gray-900 dark:text-white">Connect Class</span>
          </div>

          {/* ── Role selection ──────────────────────────────────────────────── */}
          {step === 'role' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
                Hello, welcome
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                How would you like to sign in?
              </p>

              {/* Role tabs */}
              <div className="flex bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl p-1 mb-6">
                {(['student', 'teacher'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                      tab === t
                        ? 'bg-white dark:bg-[#2D2D2D] text-[#BF0A30] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {t === 'student' ? 'Student' : 'Teacher'}
                  </button>
                ))}
              </div>

              <div className="bg-[#BF0A30]/6 dark:bg-[#BF0A30]/12 border border-[#BF0A30]/15 rounded-xl p-4 mb-6">
                {tab === 'student' ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Student access</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Track your Connect Class journey, attend sessions, and take exams.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Teacher access</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Manage cohorts, mark attendance, create exams, and communicate with students.
                    </p>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="flex">
                  <div className="phone-prefix">+254</div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="7XX XXX XXX"
                    className="input phone-input"
                    onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  />
                </div>
                <p className="form-help">OTP sent via SMS — works with any Kenyan number</p>
              </div>

              {isDemoMode && (
                <div className="flex items-center gap-2 mt-2 mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                  <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
                  Demo mode — OTP code is <strong className="ml-1">{MOCK_OTP}</strong>
                </div>
              )}

              {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

              <button onClick={sendOtp} disabled={loading || !phone} className="btn btn-primary btn-xl w-full mb-4">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
              </button>

              <div className="divider-text">or</div>

              <button onClick={() => setStep('email-form')} className="btn btn-secondary w-full gap-2 mt-4">
                <Mail className="w-4 h-4" /> Sign in with Email
              </button>

              {tab === 'student' && (
                <p className="mt-6 text-center text-sm text-gray-500">
                  New to Ruach?{' '}
                  <Link href="/connect/register" className="text-[#BF0A30] font-semibold hover:underline">
                    Register for Connect Class
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* ── OTP step ─────────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <div className="animate-fade-in">
              <button onClick={reset}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="w-14 h-14 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-[#BF0A30]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Enter OTP</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Code sent to <span className="font-semibold text-gray-800 dark:text-gray-200">{formatted}</span>
              </p>
              {isDemoMode && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-5 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                  Demo code: <strong>{MOCK_OTP}</strong>
                </p>
              )}
              <div className="flex gap-2.5 mb-6">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`otp-input flex-1 ${digit ? 'filled' : ''}`}
                  />
                ))}
              </div>
              {error && <div className="alert alert-error text-sm mb-4">{error}</div>}
              {loading && (
                <div className="flex items-center justify-center gap-2 py-3 text-gray-400 text-sm mb-4">
                  <Loader2 className="w-4 h-4 animate-spin text-[#BF0A30]" /> Verifying…
                </div>
              )}
              <button onClick={() => verifyOtp(otp.join(''))} disabled={loading || !otpComplete}
                className="btn btn-primary btn-xl w-full mb-4">Verify & Sign In</button>
              {countdown > 0 ? (
                <p className="text-center text-sm text-gray-400">Resend in <span className="font-semibold">{countdown}s</span></p>
              ) : (
                <button onClick={sendOtp} className="w-full text-center text-sm text-[#BF0A30] font-medium hover:underline">Resend OTP</button>
              )}
            </div>
          )}

          {/* ── Email form ────────────────────────────────────────────────────── */}
          {step === 'email-form' && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep('role'); setError(''); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
                {tab === 'teacher' ? 'Teacher Sign In' : 'Student Sign In'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Use your email and password</p>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input pr-12" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <div className="alert alert-error text-sm">{error}</div>}
                <Link href="/auth/forgot-password" className="block text-right text-sm text-[#BF0A30] hover:underline font-medium">
                  Forgot password?
                </Link>
                <button type="submit" disabled={loading} className="btn btn-primary btn-xl w-full">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
                </button>
              </form>
              {tab === 'student' && (
                <p className="mt-6 text-center text-sm text-gray-500">
                  New?{' '}
                  <Link href="/connect/register" className="text-[#BF0A30] font-semibold hover:underline">
                    Register for Connect Class
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <button
          onClick={toggleMode}
          className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2D2D2D] rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-[#BF0A30]/40 transition-colors"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-green-500'}`} />
          {isDemoMode ? 'Demo Mode' : 'Live Mode'}
        </button>
      </div>
    </div>
  );
}
