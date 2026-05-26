// context/AuthContext.tsx
// Central auth provider — wraps the whole app in _app.tsx
// Reads the Supabase session and profile on mount, exposes helpers.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor';

interface AuthContextValue {
  session:    Session | null;
  profile:    Profile | null;
  loading:    boolean;
  role:       UserRole | null;
  isMember:   boolean;   // role is member | leader | teacher | admin | pastor
  isTeacher:  boolean;
  isAdmin:    boolean;
  signOut:    () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
  session: null, profile: null, loading: true, role: null,
  isMember: false, isTeacher: false, isAdmin: false,
  signOut: async () => {}, refreshProfile: async () => {},
});

function setSentinelCookie(authenticated: boolean) {
  if (authenticated) {
    document.cookie = 'sb-session=1; path=/; max-age=604800; SameSite=Lax';
  } else {
    document.cookie = 'sb-session=; path=/; max-age=0; SameSite=Lax';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session,  setSession]  = useState<Session | null>(null);
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await fetchProfile(session.user.id);
  }, [session, fetchProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSentinelCookie(!!session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setSentinelCookie(!!session);
        if (session?.user?.id) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/auth/login');
  }, [router]);

  const role      = profile?.role as UserRole | null;
  const isMember  = !!role && ['member', 'leader', 'teacher', 'admin', 'pastor'].includes(role);
  const isTeacher = !!role && ['teacher', 'admin', 'pastor', 'leader'].includes(role);
  const isAdmin   = !!role && ['admin', 'pastor'].includes(role);

  return (
    <AuthContext.Provider value={{
      session, profile, loading, role,
      isMember, isTeacher, isAdmin,
      signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
