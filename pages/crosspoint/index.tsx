// pages/crosspoint/index.tsx
// Crosspoint leader login — select crosspoint, then OTP or email auth

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Home, MapPin, Users, Shield, ArrowLeft, ChevronRight, Loader2, Eye, EyeOff, Mail, Heart, Zap } from 'lucide-react';
import { mockCrosspoints } from '@/data';
import { supabase } from '@/lib/supabase';

type Step = 'landing' | 'otp' | 'email-form';

function formatKenyanPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('0') && d.length === 10) return '+254' + d.slice(1);
  if (d.startsWith('254') && d.length === 12) return '+' + d;
  if (d.startsWith('7') && d.length === 9) return '+254' + d;
  return raw;
}

export default function CrosspointSelectPage() {
  const router = useRouter();

  const [step,       setStep]       = useState<Step>('landing');
  const [selectedCp, setSelectedCp] = useState('');
  const [phone,      setPhone]      = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [otp,        setOtp]        = useState(['','','','','','']);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [countdown,  setCountdown]  = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cdRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatted   = formatKenyanPhone(phone);
  const otpComplete = otp.every(d => d);
  const activeCrosspoints = mockCrosspoints.filter(c => c.status === 'active');

  function startCountdown(secs = 60) {
    setCountdown(secs);
    if (cdRef.current) clearInterval(cdRef.current);
    cdRef.current = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(cdRef.current!); return 0; } return prev - 1; });
    }, 1000);
  }

  async function sendOtp() {
    if (!selectedCp) { setError('Please select your crosspoint first'); return; }
    setError(''); setLoading(true);
    const { error: e } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);
    if (e) { setError(e.message); return; }
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
    const { data, error: e } = await supabase.auth.verifyOtp({ phone: formatted, token: code, type: 'sms' });
    setLoading(false);
    if (e || !data.session) {
      setError(e?.message ?? 'Invalid OTP. Please try again.');
      setOtp(['','','','','','']); otpRefs.current[0]?.focus(); return;
    }
    router.push(`/crosspoint/${selectedCp}`);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCp) { setError('Please select your crosspoint'); return; }
    setLoading(true);
    const { data, error: ae } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (ae || !data.session) { setError(ae?.message ?? 'Invalid credentials.'); return; }
    router.push(`/crosspoint/${selectedCp}`);
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">

      {/* ── Left branding panel ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-[#BF0A30] to-[#1a0505] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '12px 12px',
        }} />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <img src="/brand/ruach-logo.png" alt="Ruach" className="h-10 w-auto" />
        </Link>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-6 tracking-tight">
            Crosspoint<br />Leader<br />Portal
          </h1>
          <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-xs">
            Manage your home church, track attendance, and connect your members to the heart of Ruach.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'God',       icon: Heart,  val: `${activeCrosspoints.length}`, sub: 'crosspoints' },
              { label: 'Work',      icon: Zap,    val: `${mockCrosspoints.reduce((s, c) => s + c.memberCount, 0)}`, sub: 'members' },
              { label: 'Community', icon: Users,  val: '24', sub: 'zones' },
            ].map(({ label, icon: Icon, val, sub }) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-white font-black text-base leading-none">{val}</p>
                <p className="text-white font-bold text-[10px] mt-0.5">{label}</p>
                <p className="text-white/40 text-[9px]">{sub}</p>
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
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Link href="/"><img src="/brand/ruach-logo.png" alt="Ruach" className="h-9 w-auto" /></Link>
            <div>
              <p className="font-bold text-white">Crosspoint Portal</p>
              <p className="text-xs text-gray-500">Ruach Assemblies</p>
            </div>
          </div>

          {/* ── Step: Select crosspoint ──────────────────────────────────────── */}
          {step === 'landing' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Leader Access</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Select your crosspoint and sign in to manage your home church
              </p>

              <div className="form-group">
                <label className="form-label">Your Crosspoint</label>
                <select value={selectedCp} onChange={e => { setSelectedCp(e.target.value); setError(''); }} className="select">
                  <option value="">Choose your crosspoint…</option>
                  {mockCrosspoints.map(cp => (
                    <option key={cp.id} value={cp.id}>{cp.name} — {cp.area}</option>
                  ))}
                </select>
              </div>

              {selectedCp && (() => {
                const cp = mockCrosspoints.find(c => c.id === selectedCp);
                if (!cp) return null;
                return (
                  <div className="bg-[#BF0A30]/12 border border-[#BF0A30]/20 rounded-xl p-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#BF0A30] flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{cp.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cp.area}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cp.memberCount} members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="flex gap-0">
                  <div className="flex items-center px-3 bg-[#1A1E28] border border-r-0 border-white/[0.08] rounded-l-2xl text-white/50 text-sm font-medium flex-shrink-0">
                    +254
                  </div>
                  <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="7XX XXX XXX" className="input flex-1"
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onKeyDown={e => e.key === 'Enter' && sendOtp()} />
                </div>
                <p className="form-help">OTP sent via SMS to authenticate</p>
              </div>

              {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

              <button onClick={sendOtp} disabled={loading || !selectedCp || !phone}
                className="btn btn-primary btn-xl w-full mb-4">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
              </button>

              <div className="divider-text">or</div>

              <button onClick={() => { if (!selectedCp) { setError('Please select your crosspoint first'); return; } setStep('email-form'); }}
                className="btn btn-secondary w-full gap-2 mt-4">
                <Mail className="w-4 h-4" /> Sign in with Email
              </button>

              <div className="mt-7">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Quick access</p>
                <div className="grid grid-cols-2 gap-2">
                  {mockCrosspoints.slice(0, 4).map(cp => (
                    <button key={cp.id} onClick={() => setSelectedCp(cp.id)}
                      className={`p-3.5 text-left border rounded-xl transition-all ${
                        selectedCp === cp.id
                          ? 'border-[#BF0A30] bg-[#BF0A30]/10'
                          : 'border-white/[0.08] bg-white/[0.03] hover:border-[#BF0A30]/50'
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-3.5 h-3.5 text-[#BF0A30]" />
                        <span className="font-semibold text-white text-xs">{cp.name}</span>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />{cp.area}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <Link href="/auth/login" className="text-sm text-gray-500 hover:text-[#BF0A30] transition-colors">Main Login</Link>
                <span className="text-gray-700">·</span>
                <Link href="/crosspoint/join" className="text-sm text-[#BF0A30] font-semibold hover:underline">Join a Crosspoint →</Link>
              </div>
            </div>
          )}

          {/* ── OTP ─────────────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep('landing'); setOtp(['','','','','','']); setError(''); }}
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
              {loading && <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 justify-center"><Loader2 className="w-4 h-4 animate-spin text-[#BF0A30]" /> Verifying…</div>}
              <button onClick={() => verifyOtp(otp.join(''))} disabled={loading || !otpComplete}
                className="btn btn-primary btn-xl w-full mb-4">Verify & Sign In</button>
              {countdown > 0 ? (
                <p className="text-center text-sm text-gray-400">Resend in <span className="font-semibold text-gray-300">{countdown}s</span></p>
              ) : (
                <button onClick={sendOtp} className="w-full text-center text-sm text-[#BF0A30] font-medium hover:underline">Resend OTP</button>
              )}
            </div>
          )}

          {/* ── Email form ───────────────────────────────────────────────────── */}
          {step === 'email-form' && (
            <div className="animate-fade-in">
              <button onClick={() => { setStep('landing'); setError(''); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Leader Sign In</h2>
              <p className="text-gray-400 mb-7 text-sm">
                {mockCrosspoints.find(c => c.id === selectedCp)?.name ?? 'Crosspoint'} Leader Portal
              </p>
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
                {error && <div className="alert alert-error text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="btn btn-primary btn-xl w-full">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Access Crosspoint Portal'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap gap-3 justify-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
