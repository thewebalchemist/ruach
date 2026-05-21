// pages/discipleship/index.tsx
// Kingdom Discipleship portal login — members who completed Connect Class

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, Shield, ArrowLeft, ChevronRight, Mail, Eye, EyeOff, BookOpen, Star, Flame, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Step = 'login' | 'otp' | 'email-form';
type Tab  = 'student' | 'teacher';

function formatKenyanPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('0') && d.length === 10) return '+254' + d.slice(1);
  if (d.startsWith('254') && d.length === 12) return '+' + d;
  if (d.startsWith('7') && d.length === 9) return '+254' + d;
  return raw;
}

interface ProfileResult { role: string; member_id: string | null; }

export default function DiscipleshipLogin() {
  const router = useRouter();

  const [tab,       setTab]       = useState<Tab>('student');
  const [step,      setStep]      = useState<Step>('login');
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
  const otpComplete = otp.every(d => d);

  function startCountdown(secs = 60) {
    setCountdown(secs);
    if (cdRef.current) clearInterval(cdRef.current);
    cdRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(cdRef.current!); return 0; } return p - 1; });
    }, 1000);
  }

  async function sendOtp() {
    setError(''); setLoading(true);
    const { error: e } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);
    if (e) { setError(e.message); return; }
    startCountdown(60);
    setStep('otp');
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
    const { data, error: e } = await supabase.auth.verifyOtp({ phone: formatted, token: code, type: 'sms' });
    if (e || !data.session) {
      setError(e?.message ?? 'Invalid OTP.');
      setOtp(['', '', '', '', '', '']); otpRefs.current[0]?.focus(); setLoading(false); return;
    }
    await redirectByRole(data.session.user.id);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const { data, error: ae } = await supabase.auth.signInWithPassword({ email, password });
    if (ae || !data.session) { setError(ae?.message ?? 'Invalid credentials.'); setLoading(false); return; }
    await redirectByRole(data.session.user.id);
  }

  async function redirectByRole(userId: string) {
    const { data: pd } = await supabase.from('profiles').select('role, member_id').eq('id', userId).single();
    const profile = pd as ProfileResult | null;
    const role    = profile?.role ?? '';
    if (['admin', 'pastor'].includes(role)) { router.push('/admin'); return; }
    if (['teacher', 'leader'].includes(role)) { router.push('/discipleship/dashboard'); return; }
    router.push('/discipleship/student');
  }

  function reset() { setStep('login'); setOtp(['', '', '', '', '', '']); setError(''); }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">

      {/* ── Left branding panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundImage: "url('/church-photos/church.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0040]/88 via-[#2D1060]/80 to-[#0a0020]/90" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full border border-white/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-white font-bold text-base">Ruach Assemblies</p>
            <p className="text-white/50 text-xs">Discipleship Centre</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Kingdom Discipleship</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-5 tracking-tight">
            Grow Deeper<br />
            in Your<br />
            <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' }}>Calling</span>
          </h1>

          <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-xs">
            Discipleship equips Ruach members who have completed Connect Class to walk fully in their God-given purpose.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Identity', icon: Star,  desc: 'Who you are' },
              { label: 'Purpose',  icon: Flame, desc: 'Why you\'re here' },
              { label: 'Service',  icon: Users, desc: 'Serving together' },
            ].map(({ label, icon: Icon, desc }) => (
              <div key={label} className="bg-white/8 backdrop-blur border border-white/12 rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-[#D4AF37] mx-auto mb-1.5" />
                <p className="text-white font-bold text-xs">{label}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">© 2026 Ruach Assemblies</p>
      </div>

      {/* ── Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#2D1060] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <span className="font-bold text-white">Discipleship</span>
          </div>

          {/* ── Login step */}
          {step === 'login' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome back</h2>
              <p className="text-gray-400 mb-6 text-sm">Sign in to your discipleship portal</p>

              <div className="flex bg-[#1A1A1A] rounded-2xl p-1 mb-6">
                {(['student', 'teacher'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      tab === t ? 'bg-[#2D2D2D] text-[#D4AF37] shadow-sm' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t === 'student' ? 'Member' : 'Facilitator'}
                  </button>
                ))}
              </div>

              <div className="bg-[#2D1060]/15 border border-[#2D1060]/25 rounded-xl p-4 mb-6">
                {tab === 'student' ? (
                  <>
                    <p className="text-sm font-semibold text-white mb-1">Member access</p>
                    <p className="text-xs text-gray-400">Access your discipleship journey, course materials, and progress.</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Must have completed Connect Class.{' '}
                      <Link href="/connect" className="text-[#BF0A30] font-semibold hover:underline">Not done Connect? Start here →</Link>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-white mb-1">Facilitator access</p>
                    <p className="text-xs text-gray-400">Manage discipleship cohorts, track progress, and run sessions.</p>
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
                    onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="7XX XXX XXX" className="input flex-1"
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onKeyDown={e => e.key === 'Enter' && phone && sendOtp()}
                  />
                </div>
                <p className="form-help">OTP sent via SMS · Kenyan numbers only</p>
              </div>

              {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

              <button onClick={sendOtp} disabled={loading || !phone}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors mb-4 disabled:opacity-50"
                style={{ background: '#2D1060' }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
              </button>

              <div className="divider-text">or</div>

              <button onClick={() => setStep('email-form')} className="btn btn-secondary w-full gap-2 mt-4">
                <Mail className="w-4 h-4" /> Sign in with Email
              </button>
            </div>
          )}

          {/* ── OTP step */}
          {step === 'otp' && (
            <div className="animate-fade-in">
              <button onClick={reset} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-[#2D1060]/20">
                <Shield className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Enter OTP</h2>
              <p className="text-gray-400 text-sm mb-6">Code sent to <span className="font-semibold text-gray-200">{formatted}</span></p>
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
              {loading && <div className="flex justify-center py-3 mb-4"><Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" /></div>}
              <button onClick={() => verifyOtp(otp.join(''))} disabled={loading || !otpComplete}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center transition-colors mb-4 disabled:opacity-50"
                style={{ background: '#2D1060' }}>
                Verify & Sign In
              </button>
              {countdown > 0
                ? <p className="text-center text-sm text-gray-400">Resend in <strong className="text-gray-300">{countdown}s</strong></p>
                : <button onClick={sendOtp} className="w-full text-center text-sm font-medium text-[#BF0A30] hover:underline">Resend OTP</button>}
            </div>
          )}

          {/* ── Email form */}
          {step === 'email-form' && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep('login'); setError(''); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-black text-white mb-1">Email Sign In</h2>
              <p className="text-gray-400 text-sm mb-8">Sign in with your registered email and password</p>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input pr-12" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Link href="/auth/forgot-password" className="block text-right text-sm font-medium text-[#BF0A30] hover:underline">
                  Forgot password?
                </Link>
                {error && <div className="alert alert-error text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  style={{ background: '#2D1060' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap gap-3 justify-center">
            <Link href="/connect" className="text-sm text-gray-500 hover:text-[#BF0A30] transition-colors">Connect Portal</Link>
            <span className="text-gray-700">·</span>
            <Link href="/crosspoint" className="text-sm text-gray-500 hover:text-[#BF0A30] transition-colors">Crosspoints</Link>
            <span className="text-gray-700">·</span>
            <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
