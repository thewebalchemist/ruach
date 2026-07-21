// pages/auth/login.tsx
// Admin & staff portal login — phone OTP (primary) or email/password (fallback).
// Redirects here only when accessing /admin or /control-panel without a session.

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, ChevronRight, ArrowLeft, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatKenyanPhone, isValidKenyanPhone, friendlyAuthError } from '@/lib/auth-utils';

type Step = 'method' | 'otp' | 'email-form';

export default function AdminLogin() {
  const router = useRouter();

  const [step,      setStep]      = useState<Step>('method');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const cdRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatted  = formatKenyanPhone(phone);
  const phoneValid = isValidKenyanPhone(formatted);
  const otpDone    = otp.every(d => d);

  // If the middleware redirected here with a redirectTo that isn't an admin
  // route, pass it along to the member login page instead.
  useEffect(() => {
    if (!router.isReady) return;
    const redirectTo = router.query.redirectTo as string | undefined;
    if (redirectTo && !redirectTo.startsWith('/admin') && !redirectTo.startsWith('/control-panel')) {
      router.replace(`/member/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
  }, [router.isReady, router.query.redirectTo]);

  // Already signed in? Don't strand the user on the login form — forward them
  // by role. This is what fixes the "bounced to login while still logged in"
  // loop after cookies are cleared or a tab wakes up.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session?.user?.id) redirectByRole(data.session.user.id);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCountdown(secs = 60) {
    setCountdown(secs);
    if (cdRef.current) clearInterval(cdRef.current);
    cdRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(cdRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  // ── After a successful auth, redirect by role ──────────────────────────────
  async function redirectByRole(userId: string) {
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('role, member_id')
        .eq('id', userId)
        .single();

      if (fetchErr) throw fetchErr;

      const role       = data?.role ?? '';
      const redirectTo = router.query.redirectTo as string | undefined;

      if (['admin', 'pastor'].includes(role)) {
        const dest = (redirectTo?.startsWith('/admin') || redirectTo?.startsWith('/control-panel'))
          ? redirectTo
          : '/auth/portal-select';
        await router.push(dest);
      } else if (role === 'media') {
        const dest = redirectTo?.startsWith('/control-panel') ? redirectTo : '/control-panel';
        await router.push(dest);
      } else if (['teacher', 'leader'].includes(role)) {
        // teacher/leader can use the church-admin area but not the control panel
        const dest = redirectTo?.startsWith('/admin') ? redirectTo : '/admin';
        await router.push(dest);
      } else if (data?.member_id) {
        await router.push('/member');
      } else {
        await router.push('/connect/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Phone OTP ──────────────────────────────────────────────────────────────
  async function handleSendOtp() {
    if (!phoneValid) { setError('Please enter a valid Kenyan phone number.'); return; }
    setError(''); setLoading(true);
    try {
      const { error: e } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (e) { setError(friendlyAuthError(e.message, 'otp')); return; }
      startCountdown(60);
      setStep('otp');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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
    try {
      const { data, error: e } = await supabase.auth.verifyOtp({ phone: formatted, token: code, type: 'sms' });
      if (e || !data.session) {
        setError(friendlyAuthError(e?.message, 'otp'));
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        setLoading(false);
        return;
      }
      await redirectByRole(data.session.user.id);
    } catch {
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  }

  // ── Email / password ───────────────────────────────────────────────────────
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data, error: ae } = await supabase.auth.signInWithPassword({ email, password });
      if (ae || !data.session) {
        setError(friendlyAuthError(ae?.message));
        setLoading(false);
        return;
      }
      await redirectByRole(data.session.user.id);
    } catch {
      setError('Sign in failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0000]">
      <img src="/church-photos/dec-2024.jpg" alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0000]/92 via-[#6A0010]/65 to-[#BF0A30]/18" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ── Left branding ─────────────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-10 w-auto" />
          </Link>
          <div>
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4">Admin &amp; Control Panel</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-4 tracking-tight">
              Kingdom<br />Management<br /><span className="text-[#BF0A30]">Portal.</span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              For admins, pastors, teachers, and leaders only. Manage sermons, events, members, and ministry operations.
            </p>
            <div className="mt-6 bg-white/[0.05] border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-xs">Not staff?</p>
              <div className="flex flex-col gap-1.5 mt-2">
                <a href="/member/login" className="text-[#BF0A30] text-sm font-semibold hover:underline">Member Portal →</a>
                <a href="/connect" className="text-white/50 text-sm hover:text-white hover:underline">Connect Portal →</a>
              </div>
            </div>
          </div>
          <p className="text-white/25 text-xs">© 2026 Ruach Assemblies</p>
        </div>

        {/* ── Form panel ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-5 lg:p-12 min-h-screen">
          <div className="w-full max-w-[420px]">

            <div className="flex flex-col items-center mb-7 lg:hidden">
              <Link href="/"><img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-12 w-auto mb-3" /></Link>
              <p className="text-white/70 text-sm">Admin Portal</p>
            </div>

            <div className="bg-[#0F0F0F] rounded-3xl shadow-2xl p-7 sm:p-8 border border-white/[0.07]">

              {/* ── Choose method ──────────────────────────────────────────── */}
              {step === 'method' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome back</h2>
                  <p className="text-gray-400 mb-8 text-sm">Sign in to access the admin portal</p>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-[#1A1E28] border border-r-0 border-white/[0.08] rounded-l-2xl text-white/50 text-sm font-medium flex-shrink-0">
                        +254
                      </div>
                      <input type="tel" value={phone}
                        onChange={e => { setPhone(e.target.value); setError(''); }}
                        placeholder="7XX XXX XXX" className="input rounded-l-none flex-1"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()} />
                    </div>
                    <p className="form-help">A 6-digit OTP will be sent to this number</p>
                  </div>

                  {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

                  <button onClick={handleSendOtp} disabled={loading || !phone} className="btn btn-primary btn-xl w-full mb-6">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</>
                      : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
                  </button>

                  <div className="divider-text my-6">or sign in with email</div>

                  <button onClick={() => setStep('email-form')} className="btn btn-secondary w-full gap-2">
                    <Mail className="w-4 h-4" /> Continue with Email
                  </button>

                  <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-wrap gap-3 justify-center">
                    <Link href="/connect" className="text-sm text-gray-500 hover:text-[#BF0A30] transition-colors">Connect Portal</Link>
                    <span className="text-gray-700">·</span>
                    <Link href="/discipleship" className="text-sm text-gray-500 hover:text-[#BF0A30] transition-colors">Discipleship</Link>
                    <span className="text-gray-700">·</span>
                    <Link href="/crosspoint" className="text-sm text-gray-500 hover:text-[#BF0A30] transition-colors">Crosspoints</Link>
                  </div>
                </div>
              )}

              {/* ── OTP verify ─────────────────────────────────────────────── */}
              {step === 'otp' && (
                <div className="animate-fade-in">
                  <button onClick={() => { setStep('method'); setOtp(['', '', '', '', '', '']); setError(''); }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <div className="w-14 h-14 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center mb-5">
                    <Shield className="w-7 h-7 text-[#BF0A30]" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Enter OTP</h2>
                  <p className="text-gray-400 mb-6 text-sm">
                    Code sent to <span className="font-semibold text-gray-200">{formatted}</span>
                  </p>
                  <div className="flex gap-3 mb-6">
                    {otp.map((digit, i) => (
                      <input key={i} ref={el => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        className={`otp-input flex-1 ${digit ? 'filled' : ''}`} />
                    ))}
                  </div>
                  {error && <div className="alert alert-error text-sm mb-4">{error}</div>}
                  {loading && (
                    <div className="flex items-center justify-center gap-3 py-4 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin text-[#BF0A30]" />
                      <span className="text-sm">Verifying…</span>
                    </div>
                  )}
                  <button onClick={() => verifyOtp(otp.join(''))} disabled={loading || !otpDone}
                    className="btn btn-primary btn-xl w-full mb-4">
                    Verify &amp; Sign In
                  </button>
                  {countdown > 0
                    ? <p className="text-center text-sm text-gray-500">Resend in <span className="font-semibold text-gray-300">{countdown}s</span></p>
                    : <button onClick={handleSendOtp} className="w-full text-center text-sm text-[#BF0A30] hover:underline font-medium">Resend OTP</button>}
                </div>
              )}

              {/* ── Email / password ───────────────────────────────────────── */}
              {step === 'email-form' && (
                <div className="animate-fade-in">
                  <button onClick={() => { setStep('method'); setError(''); }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Email Sign In</h2>
                  <p className="text-gray-400 mb-8 text-sm">Admin and staff portal access</p>
                  <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="admin@ruachtabernacle.org" required className="input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="relative">
                        <input type={showPwd ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••" required className="input pr-12" />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300">
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
            </div>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
              <Link href="/connect" className="text-white/50 text-xs hover:text-white transition-colors">Connect Portal</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/discipleship" className="text-white/50 text-xs hover:text-white transition-colors">Discipleship</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/" className="text-white/50 text-xs hover:text-white transition-colors">Back to site</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
