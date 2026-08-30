// pages/discipleship/index.tsx
// Kingdom Discipleship portal login — same design as Connect portal

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, Shield, ArrowLeft, ChevronRight, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePhoneOtp } from '@/hooks/usePhoneOtp';

type Step = 'role' | 'otp' | 'email-form';
type Tab  = 'student' | 'teacher';
interface ProfileResult { role: string; member_id: string | null; }

export default function DiscipleshipLogin() {
  const router = useRouter();

  const [tab,       setTab]       = useState<Tab>('student');
  const [step,      setStep]      = useState<Step>('role');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError,   setEmailError]   = useState('');

  async function redirectByRole(userId: string) {
    const { data: pd } = await supabase.from('profiles').select('role, member_id').eq('id', userId).single();
    const profile = pd as ProfileResult | null;
    const role    = profile?.role ?? '';

    if (['admin', 'pastor'].includes(role)) { router.push('/admin'); return; }

    if (tab === 'teacher') {
      if (!['teacher', 'admin', 'pastor', 'leader'].includes(role)) {
        setEmailError('You do not have facilitator access.'); await supabase.auth.signOut(); return;
      }
      router.push('/discipleship/dashboard'); return;
    }

    // Student tab — must be a member who has graduated Connect
    if (!profile?.member_id) {
      setEmailError('You must have graduated from Connect Class to access Discipleship. Please use the Connect portal.');
      await supabase.auth.signOut(); return;
    }
    router.push('/discipleship/student');
  }

  const {
    phone, setPhone, formatted,
    otp, otpComplete, otpRefs, handleOtpChange, handleOtpKey,
    loading, error, countdown,
    sendOtp, verifyOtp, reset: resetOtp,
  } = usePhoneOtp(redirectByRole);

  async function handleSendOtp() {
    if (await sendOtp()) setStep('otp');
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault(); setEmailError(''); setEmailLoading(true);
    try {
      const { data, error: ae } = await supabase.auth.signInWithPassword({ email, password });
      if (ae || !data.session) { setEmailError(ae?.message ?? 'Invalid credentials.'); return; }
      await redirectByRole(data.user.id);
    } finally {
      setEmailLoading(false);
    }
  }

  function reset() { setStep('role'); resetOtp(); }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0000]">

      {/* Background */}
      <img src="/church-photos/dec-2024.jpg" alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0000]/90 via-[#6A0010]/60 to-[#BF0A30]/20" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* ── Left branding panel ──────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-10 w-auto" />
          </Link>

          <div>
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4">Kingdom Discipleship</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-8 tracking-tight">
              Grow Deeper<br />
              in Your<br />
              <span className="text-[#BF0A30]">Calling.</span>
            </h1>

            <div className="bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-6">
              <p className="text-white/85 text-sm italic leading-relaxed mb-4">
                &ldquo;Discipleship is where belief becomes conviction and conviction becomes a lifestyle.
                KDC equips you to walk fully in your God-given purpose.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img src="/brand/rev-julian.png" alt="Rev. Julian Kyula" className="w-10 h-10 rounded-full object-cover object-top border border-[#D4AF37]/30"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div>
                  <p className="text-[#D4AF37] text-xs font-bold">Rev. Julian Kyula</p>
                  <p className="text-white/40 text-[11px]">Visionary &amp; Founder</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/25 text-xs">© 2026 Ruach Assemblies</p>
        </div>

        {/* ── Form panel ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-5 lg:p-12 min-h-screen">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="flex flex-col items-center mb-7 lg:hidden">
              <Link href="/"><img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-12 w-auto mb-3" /></Link>
              <p className="text-white/70 text-sm">Kingdom Discipleship Centre</p>
            </div>

            {/* Card */}
            <div className="bg-[#0F0F0F] rounded-3xl shadow-2xl p-7 sm:p-8 border border-white/[0.07]">

              {/* ── Role selection ────────────────────────────────────────── */}
              {step === 'role' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Hello, welcome</h2>
                  <p className="text-gray-400 mb-8 text-sm">How would you like to sign in?</p>

                  <div className="flex bg-[#1A1A1A] rounded-2xl p-1 mb-6">
                    {(['student', 'teacher'] as Tab[]).map(t => (
                      <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                          tab === t ? 'bg-[#2D2D2D] text-[#BF0A30] shadow-sm' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {t === 'student' ? 'Member' : 'Facilitator'}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#BF0A30]/12 border border-[#BF0A30]/20 rounded-xl p-4 mb-6">
                    {tab === 'student' ? (
                      <>
                        <p className="text-sm font-semibold text-white mb-1">Member access</p>
                        <p className="text-xs text-gray-400">
                          Access your KDC course materials, track your progress, and attend sessions.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          You must have completed Connect Class.{' '}
                          <Link href="/connect" className="text-[#BF0A30] font-semibold hover:underline">Not done Connect? Start here →</Link>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-white mb-1">Facilitator access</p>
                        <p className="text-xs text-gray-400">
                          Manage cohorts, track student progress, create exams, and run sessions.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="flex gap-0">
                      <div className="flex items-center px-3 bg-[#1A1E28] border border-r-0 border-white/[0.08] rounded-l-2xl text-white/50 text-sm font-medium flex-shrink-0">
                        +254
                      </div>
                      <input
                        type="tel" value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="7XX XXX XXX" className="input flex-1"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      />
                    </div>
                    <p className="form-help">OTP sent via SMS — works with any Kenyan number</p>
                  </div>

                  {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

                  <button onClick={handleSendOtp} disabled={loading || !phone} className="btn btn-primary btn-xl w-full mb-4">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
                  </button>

                  <div className="divider-text">or</div>

                  <button onClick={() => setStep('email-form')} className="btn btn-secondary w-full gap-2 mt-4">
                    <Mail className="w-4 h-4" /> Sign in with Email
                  </button>
                </div>
              )}

              {/* ── OTP step ─────────────────────────────────────────────── */}
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
                    className="btn btn-primary btn-xl w-full mb-4">Verify &amp; Sign In</button>
                  {countdown > 0 ? (
                    <p className="text-center text-sm text-gray-400">Resend in <span className="font-semibold text-gray-300">{countdown}s</span></p>
                  ) : (
                    <button onClick={sendOtp} className="w-full text-center text-sm text-[#BF0A30] font-medium hover:underline">Resend OTP</button>
                  )}
                </div>
              )}

              {/* ── Email form ────────────────────────────────────────────── */}
              {step === 'email-form' && (
                <div className="animate-fade-in">
                  <button onClick={() => { setStep('role'); setEmailError(''); }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                    {tab === 'teacher' ? 'Facilitator Sign In' : 'Member Sign In'}
                  </h2>
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
                          onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input pr-12" />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {emailError && <div className="alert alert-error text-sm">{emailError}</div>}
                    <Link href="/auth/forgot-password" className="block text-right text-sm text-[#BF0A30] hover:underline font-medium">
                      Forgot password?
                    </Link>
                    <button type="submit" disabled={emailLoading} className="btn btn-primary btn-xl w-full">
                      {emailLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
              <Link href="/connect" className="text-white/50 text-xs hover:text-white transition-colors">Connect Portal</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/member/login" className="text-white/50 text-xs hover:text-white transition-colors">Member Login</Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="/" className="text-white/50 text-xs hover:text-white transition-colors">Back to site</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
