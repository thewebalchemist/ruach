// pages/auth/reset-password.tsx
// Landing page for both the native Supabase reset-link flow
// (pages/auth/forgot-password.tsx) and the new generic contact-based flow
// (pages/api/auth/forgot-password.ts) — both eventually redirect here.
//
// Handles two possible redirect shapes from Supabase's recovery link:
//   - PKCE: ?code=... (the default for @supabase/ssr's createBrowserClient)
//   - Implicit: #access_token=...&refresh_token=...&type=recovery (older links)
// plus the #error=...&error_code=otp_expired shape for used/expired links.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PASSWORD_RULES, passwordMeetsPolicy } from '@/lib/password';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase]   = useState<'verifying' | 'ready' | 'error' | 'done'>('verifying');
  const [error, setError]   = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!router.isReady) return;

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashError = hash.get('error_code');
      if (hashError) {
        setError(hashError === 'otp_expired' ? 'This link has expired — request a new one.' : 'This link is invalid.');
        setPhase('error');
        return;
      }

      const code = router.query.code as string | undefined;
      if (code) {
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) { setError('This link is invalid or has expired.'); setPhase('error'); return; }
        setPhase('ready');
        return;
      }

      const accessToken  = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error: sessionErr } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (sessionErr) { setError('This link is invalid or has expired.'); setPhase('error'); return; }
        setPhase('ready');
        return;
      }

      // No recovery params at all — maybe already has a session (revisited page)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setPhase('ready'); return; }

      setError('This link is invalid or has expired.');
      setPhase('error');
    })();
  }, [router.isReady, router.query.code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordMeetsPolicy(password)) return;
    if (password !== confirm) { setError("Passwords don't match"); return; }

    setSubmitting(true);
    setError('');
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateErr) { setError(updateErr.message); return; }
    setPhase('done');
  }

  return (
    <div className="min-h-screen bg-[#0A0000] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0F0F0F] rounded-3xl shadow-2xl p-8 border border-white/[0.07]">

          {phase === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Verifying your link…</p>
            </div>
          )}

          {phase === 'error' && (
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-[#BF0A30] mx-auto mb-4" />
              <h1 className="text-xl font-black text-white mb-2">Link expired</h1>
              <p className="text-gray-400 text-sm mb-6">{error}</p>
              <Link href="/auth/forgot-password" className="btn btn-primary w-full">Request a new link</Link>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-white tracking-tight">Set a new password</h1>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="password" value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input pl-10" required />
                  </div>
                  <ul className="mt-2 space-y-1">
                    {PASSWORD_RULES.map(rule => (
                      <li key={rule.id} className={`text-xs ${rule.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
                        {rule.test(password) ? '✓' : '○'} {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="input" required />
                </div>
                {error && <div className="alert alert-error text-sm">{error}</div>}
                <button type="submit" disabled={submitting || !passwordMeetsPolicy(password) || password !== confirm}
                  className="btn btn-primary btn-xl w-full">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save New Password'}
                </button>
              </form>
            </>
          )}

          {phase === 'done' && (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h1 className="text-xl font-black text-white mb-2">Password updated</h1>
              <p className="text-gray-400 text-sm mb-6">You can now sign in with your new password.</p>
              <Link href="/auth/login" className="btn btn-primary w-full">Back to login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
