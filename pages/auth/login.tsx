// pages/auth/login.tsx
// Admin & staff login — OTP primary, email fallback, demo/live mode toggle

import { useState, FormEvent, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, ChevronRight, ArrowLeft, Shield, Heart, Zap, Users, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useMode } from '@/context/ModeContext';

const MOCK_OTP = '123456';

type Step = 'method' | 'otp' | 'email-form';
interface ProfileResult { role: string; member_id: string | null; }

function formatKenyanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '+254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return '+' + digits;
  if (digits.startsWith('7') && digits.length === 9)    return '+254' + digits;
  return raw;
}

function isValidKenyanPhone(phone: string): boolean {
  return /^\+254[17]\d{8}$/.test(phone);
}

export default function AdminLogin() {
  const router = useRouter();
  const { isDemoMode, toggleMode } = useMode();

  const [step,      setStep]      = useState<Step>('method');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs      = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formattedPhone = formatKenyanPhone(phone);
  const phoneValid     = isValidKenyanPhone(formattedPhone);

  function startCountdown(secs = 60) {
    setCountdown(secs);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(countdownRef.current!); return 0; } return prev - 1; });
    }, 1000);
  }

  async function handleSendOtp() {
    if (!phoneValid) { setError('Please enter a valid Kenyan phone number'); return; }
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (isDemoMode) { startCountdown(60); setStep('otp'); return; }
    const { error: e } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    if (e) { setError(e.message); return; }
    startCountdown(60); setStep('otp');
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[index] = value; setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every(d => d)) verifyOtp(next.join(''));
  }

  function handleOtpKey(index: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }

  async function verifyOtp(code: string) {
    setError(''); setLoading(true);
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 900));
      setLoading(false);
      if (code !== MOCK_OTP) {
        setError('Invalid code. Demo OTP is ' + MOCK_OTP);
        setOtp(['','','','','','']); otpRefs.current[0]?.focus(); return;
      }
      router.push('/admin'); return;
    }
    const { data, error: e } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: code, type: 'sms' });
    if (e || !data.session) {
      setError(e?.message ?? 'Invalid OTP. Please try again.');
      setOtp(['','','','','','']); otpRefs.current[0]?.focus();
      setLoading(false); return;
    }
    await redirectByRole(data.session.user.id);
  }

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
      router.push('/admin'); return;
    }
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.session) {
      setError(authError?.message ?? 'Invalid email or password.');
      setLoading(false); return;
    }
    await redirectByRole(data.session.user.id);
  }

  async function redirectByRole(userId: string) {
    const { data: profileData } = await supabase.from('profiles').select('role, member_id').eq('id', userId).single();
    const profile = profileData as ProfileResult | null;
    const role    = profile?.role ?? '';
    if (['admin', 'pastor'].includes(role)) router.push('/admin');
    else if (['teacher', 'leader'].includes(role)) router.push('/connect/dashboard');
    else if (profile?.member_id) router.push('/member');
    else router.push('/connect/student');
  }

  const otpComplete = otp.every(d => d);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0000]">

      {/* Full-screen background */}
      <img
        src="/church-photos/dec-2024.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0000]/92 via-[#6A0010]/65 to-[#BF0A30]/18" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ── Left branding — desktop only ──────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-10 w-auto" />
          </div>

          <div>
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4">Admin Portal</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-8 tracking-tight">
              Kingdom<br />
              Management<br />
              <span className="text-[#BF0A30]">Portal.</span>
            </h1>

            <div className="bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-6">
              <p className="text-white/85 text-sm italic leading-relaxed mb-4">
                &ldquo;We are building a platform of excellence, order and the beauty of
                God&apos;s Kingdom. Welcome to the house.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img src="/brand/rev-julian.png" alt="Rev. Julian Kyula" className="w-10 h-10 rounded-full object-cover object-top border border-[#D4AF37]/30"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div>
                  <p className="text-[#D4AF37] text-xs font-bold">Rev. Julian Kyula</p>
                  <p className="text-white/40 text-[11px]">Visionary & Founder</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/25 text-xs">© 2026 Ruach Assemblies</p>
        </div>

        {/* ── Form panel ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-5 lg:p-12 min-h-screen">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="flex flex-col items-center mb-7 lg:hidden">
              <img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-12 w-auto mb-3" />
              <p className="text-white/70 text-sm">Admin Portal</p>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-[#0F0F0F] rounded-3xl shadow-2xl p-7 sm:p-8">

          {/* ── STEP: Choose method ─────────────────────────────────────────── */}
          {step === 'method' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
                Welcome back
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                Sign in to access the admin portal
              </p>

              <div className="space-y-3 mb-6">
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
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                  <p className="form-help">A 6-digit OTP will be sent to this number</p>
                </div>

                {error && <div className="alert alert-error text-sm">{error}</div>}

                {isDemoMode && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                    <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
                    Demo mode — use any number, OTP code is <strong className="ml-1">{MOCK_OTP}</strong>
                  </div>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={loading || !phone}
                  className="btn btn-primary btn-xl w-full"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                    : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>

              <div className="divider-text my-6">or sign in with email</div>

              <button onClick={() => setStep('email-form')} className="btn btn-secondary w-full gap-2">
                <Mail className="w-4 h-4" /> Continue with Email
              </button>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.05] flex flex-wrap gap-3 justify-center">
                <Link href="/connect" className="text-sm text-gray-400 hover:text-[#BF0A30] transition-colors">Connect Portal</Link>
                <span className="text-gray-200 dark:text-gray-700">·</span>
                <Link href="/discipleship" className="text-sm text-gray-400 hover:text-[#BF0A30] transition-colors">Discipleship</Link>
                <span className="text-gray-200 dark:text-gray-700">·</span>
                <Link href="/crosspoint" className="text-sm text-gray-400 hover:text-[#BF0A30] transition-colors">Crosspoints</Link>
              </div>
            </div>
          )}

          {/* ── STEP: OTP verification ──────────────────────────────────────── */}
          {step === 'otp' && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep('method'); setOtp(['','','','','','']); setError(''); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-[#BF0A30]" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Enter OTP</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">
                Code sent to <span className="font-semibold text-gray-700 dark:text-gray-200">{formattedPhone}</span>
              </p>
              {isDemoMode && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-6 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                  Demo code: <strong>{MOCK_OTP}</strong>
                </p>
              )}

              <div className="flex gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`otp-input flex-1 ${digit ? 'filled' : ''}`}
                  />
                ))}
              </div>

              {error && <div className="alert alert-error text-sm mb-4">{error}</div>}
              {loading && (
                <div className="flex items-center justify-center gap-3 py-4 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin text-[#BF0A30]" />
                  <span className="text-sm">Verifying…</span>
                </div>
              )}

              <button onClick={() => verifyOtp(otp.join(''))} disabled={loading || !otpComplete}
                className="btn btn-primary btn-xl w-full mb-4">
                Verify & Sign In
              </button>

              {countdown > 0 ? (
                <p className="text-center text-sm text-gray-400">
                  Resend in <span className="font-semibold text-gray-700 dark:text-gray-300">{countdown}s</span>
                </p>
              ) : (
                <button onClick={handleSendOtp} className="w-full text-center text-sm text-[#BF0A30] hover:underline font-medium">
                  Resend OTP
                </button>
              )}
            </div>
          )}

          {/* ── STEP: Email/password ───────────────────────────────────────── */}
          {step === 'email-form' && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep('method'); setError(''); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Email Sign In</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Admin and staff portal access</p>

              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@ruach.church" required className="input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input pr-12" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <div className="alert alert-error text-sm">{error}</div>}

                <div className="text-right">
                  <Link href="/auth/forgot-password" className="text-sm text-[#BF0A30] hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-xl w-full">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
                </button>
              </form>
            </div>
          )}
            </div>{/* end card */}

            {/* Footer links */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
              <Link href="/connect" className="text-white/50 text-xs hover:text-white transition-colors">Connect Portal</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/discipleship" className="text-white/50 text-xs hover:text-white transition-colors">Discipleship</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/crosspoint" className="text-white/50 text-xs hover:text-white transition-colors">Crosspoint</Link>
            </div>

            {/* Mode toggle */}
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleMode}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/8 border border-white/12 rounded-xl text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-green-500'}`} />
                {isDemoMode ? 'Demo Mode' : 'Live Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
