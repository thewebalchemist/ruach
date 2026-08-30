// hooks/usePhoneOtp.ts
// Shared phone-OTP login state/logic, extracted from what used to be five
// near-identical copies (pages/auth/login.tsx, pages/member/login.tsx,
// pages/connect/index.tsx, pages/discipleship/index.tsx, pages/crosspoint/index.tsx)
// each hand-rolling the same digit-array input, countdown timer, and
// Supabase-native phone OTP calls. Now backed by the custom OTP system
// (pages/api/auth/{send,verify}-phone-otp.ts) instead of Supabase's built-in
// phone auth, which requires a separate SMS provider (Twilio/etc.) configured
// in the Supabase dashboard — this app's actual SMS vendor is BongaSMS, wired
// directly, so the native flow was likely non-functional in production.
//
// Each page keeps its own JSX/branding; this hook only owns state + calls.
import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { normalizePhone, formatPhoneDisplay, isValidKenyanPhone, toE164 } from '@/lib/phone';

export function usePhoneOtp(onVerified: (userId: string, isNewUser: boolean) => Promise<void> | void) {
  const [phone, setPhoneRaw] = useState('');
  const [otp, setOtp]        = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cdRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const normalized = normalizePhone(phone);
  const phoneValid = isValidKenyanPhone(normalized);
  const formatted  = formatPhoneDisplay(normalized);
  const otpComplete = otp.every(d => d);

  function setPhone(v: string) {
    setPhoneRaw(v);
    setError('');
  }

  function startCountdown(secs = 30) {
    setCountdown(secs);
    if (cdRef.current) clearInterval(cdRef.current);
    cdRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(cdRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const sendOtp = useCallback(async () => {
    if (!phoneValid) { setError('Please enter a valid Kenyan phone number.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: toE164(normalized), intent: 'login' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to send OTP. Please try again.'); return; }
      startCountdown(30);
      return true;
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [normalized, phoneValid]);

  const verifyOtp = useCallback(async (code: string) => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: toE164(normalized), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }

      const { error: verifyErr } = await supabase.auth.verifyOtp({ token_hash: data.tokenHash, type: 'email' });
      if (verifyErr) { setError('Failed to establish session. Please try again.'); return; }

      await onVerified(data.userId, data.isNewUser);
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [normalized, onVerified]);

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every(d => d)) verifyOtp(next.join(''));
  }

  function handleOtpKey(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function reset() {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setPhoneRaw('');
    setCountdown(0);
  }

  return {
    phone, setPhone, formatted, phoneValid,
    otp, otpComplete, otpRefs, handleOtpChange, handleOtpKey,
    loading, error, setError, countdown,
    sendOtp, verifyOtp, reset,
  };
}
