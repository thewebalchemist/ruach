// pages/member/login.tsx
// Member portal login — phone OTP (primary) or email/password (fallback).
// Anyone who has a member_id lands on /member. Non-members are rejected.

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, Shield, ArrowLeft, ChevronRight, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePhoneOtp } from '@/hooks/usePhoneOtp';
import { friendlyAuthError } from '@/lib/auth-utils';

type Step = 'login' | 'otp' | 'email-form';

export default function MemberLogin() {
  const router = useRouter();

  const [step,      setStep]      = useState<Step>('login');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError,   setEmailError]   = useState('');

  // ── After a successful auth, check member_id and redirect ──────────────────
  async function redirectIfMember(userId: string) {
    const { data } = await supabase.from('profiles').select('member_id').eq('id', userId).single();

    if (data?.member_id) {
      const dest = (router.query.redirectTo as string) || '/member';
      await router.push(dest);
    } else {
      setEmailError("You haven't graduated from Connect Class yet. Please use the Connect portal to continue your journey.");
      await supabase.auth.signOut();
    }
  }

  const {
    phone, setPhone, formatted,
    otp, otpComplete, otpRefs, handleOtpChange, handleOtpKey,
    loading, error, countdown,
    sendOtp, verifyOtp, reset: resetOtp,
  } = usePhoneOtp(redirectIfMember);

  async function handleSendOtp() {
    if (await sendOtp()) setStep('otp');
  }

  // ── Email / password ───────────────────────────────────────────────────────
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault(); setEmailError(''); setEmailLoading(true);
    try {
      const { data, error: ae } = await supabase.auth.signInWithPassword({ email, password });
      if (ae || !data.session) {
        setEmailError(friendlyAuthError(ae?.message));
        return;
      }
      await redirectIfMember(data.user.id);
    } catch {
      setEmailError('Sign in failed. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  }

  function reset() {
    setStep('login');
    resetOtp();
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0000]">
      <img src="/church-photos/dec-2024.jpg" alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0000]/90 via-[#6A0010]/60 to-[#BF0A30]/20" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ── Left branding ─────────────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-10 w-auto" />
          </Link>
          <div>
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4">Member Portal</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-8 tracking-tight">
              Welcome<br />Home to<br /><span className="text-[#BF0A30]">Ruach.</span>
            </h1>
            <div className="bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-6">
              <p className="text-white/85 text-sm italic leading-relaxed mb-4">
                &ldquo;You are not just a church attendee — you are family. This is your home,
                your community, and your place to grow and serve.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img src="/brand/rev-julian.png" alt="Rev. Julian Kyula"
                  className="w-10 h-10 rounded-full object-cover object-top border border-[#D4AF37]/30"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div>
                  <p className="text-[#D4AF37] text-xs font-bold">Rev. Julian Kyula</p>
                  <p className="text-white/40 text-[11px]">Visionary &amp; Founder</p>
                </div>
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
              <p className="text-white/70 text-sm">Member Portal</p>
            </div>

            <div className="bg-[#0F0F0F] rounded-3xl shadow-2xl p-7 sm:p-8 border border-white/[0.07]">

              {/* ── Phone OTP step ───────────────────────────────────────── */}
              {step === 'login' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome back</h2>
                  <p className="text-gray-400 mb-8 text-sm">Sign in to your member dashboard</p>

                  <div className="bg-[#BF0A30]/12 border border-[#BF0A30]/20 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-white mb-1">Member access</p>
                    <p className="text-xs text-gray-400">
                      Access your member dashboard, Discipleship progress, and Crosspoint home church.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-[#1A1E28] border border-r-0 border-white/[0.08] rounded-l-2xl text-white/50 text-sm font-medium flex-shrink-0">
                        +254
                      </div>
                      <input type="tel" value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="7XX XXX XXX" className="input flex-1"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()} />
                    </div>
                    <p className="form-help">OTP sent via SMS — works with any Kenyan number</p>
                  </div>

                  {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

                  <button onClick={handleSendOtp} disabled={loading || !phone} className="btn btn-primary btn-xl w-full mb-4">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</>
                      : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
                  </button>

                  <div className="divider-text">or</div>

                  <button onClick={() => setStep('email-form')} className="btn btn-secondary w-full gap-2 mt-4">
                    <Mail className="w-4 h-4" /> Sign in with Email
                  </button>

                  <p className="mt-6 text-center text-sm text-gray-500">
                    Not yet a member?{' '}
                    <Link href="/connect/register" className="text-[#BF0A30] font-semibold hover:underline">
                      Start with Connect Class
                    </Link>
                  </p>
                </div>
              )}

              {/* ── OTP verify step ──────────────────────────────────────── */}
              {step === 'otp' && (
                <div className="animate-fade-in">
                  <button onClick={reset}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <div className="w-14 h-14 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center mb-5">
                    <Shield className="w-7 h-7 text-[#BF0A30]" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Enter OTP</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Code sent to <span className="font-semibold text-gray-200">{formatted}</span>
                  </p>
                  <div className="flex gap-2.5 mb-6">
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
                    <div className="flex items-center justify-center gap-2 py-3 text-gray-400 text-sm mb-4">
                      <Loader2 className="w-4 h-4 animate-spin text-[#BF0A30]" /> Verifying…
                    </div>
                  )}
                  <button onClick={() => verifyOtp(otp.join(''))} disabled={loading || !otpComplete}
                    className="btn btn-primary btn-xl w-full mb-4">
                    Verify &amp; Sign In
                  </button>
                  {countdown > 0
                    ? <p className="text-center text-sm text-gray-400">Resend in <span className="font-semibold text-gray-300">{countdown}s</span></p>
                    : <button onClick={handleSendOtp} className="w-full text-center text-sm text-[#BF0A30] font-medium hover:underline">Resend OTP</button>}
                </div>
              )}

              {/* ── Email/password step ───────────────────────────────────── */}
              {step === 'email-form' && (
                <div className="animate-fade-in">
                  <button onClick={() => { setStep('login'); setEmailError(''); }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Email Sign In</h2>
                  <p className="text-gray-400 mb-8 text-sm">Use your email and password</p>
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
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••" required className="input pr-12" />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {emailError && <div className="alert alert-error text-sm">{emailError}</div>}
                    <Link href="/auth/forgot-password"
                      className="block text-right text-sm text-[#BF0A30] hover:underline font-medium">
                      Forgot password?
                    </Link>
                    <button type="submit" disabled={emailLoading} className="btn btn-primary btn-xl w-full">
                      {emailLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
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
