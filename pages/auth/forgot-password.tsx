// pages/auth/forgot-password.tsx
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [loading,   setLoading]   = useState(false);
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });
      if (e) { setError(e.message); return; }
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0000] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/brand/ruach-logo.png" alt="Ruach Tabernacle" className="h-10 w-auto" />
        </div>

        <div className="bg-[#0F0F0F] rounded-3xl shadow-2xl p-8 border border-white/[0.07]">
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-white tracking-tight">Forgot your password?</h1>
                <p className="text-gray-400 mt-2 text-sm">Enter your email and we'll send a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@ruachtabernacle.org"
                      className="input pl-10" required />
                  </div>
                </div>

                {error && <div className="alert alert-error text-sm">{error}</div>}

                <button type="submit" disabled={loading} className="btn btn-primary btn-xl w-full">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">Check your email</h1>
              <p className="text-gray-400 text-sm mb-6">
                We sent a reset link to<br />
                <span className="font-semibold text-white">{email}</span>
              </p>
              <button onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Didn't receive it?{' '}
                <span className="text-[#BF0A30] font-medium">Send again</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
