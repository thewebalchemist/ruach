// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';

export type UserRole = 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor' | 'media';

interface AuthContextValue {
  session:          Session | null;
  profile:          Profile | null;
  loading:          boolean;
  role:             UserRole | null;
  isMember:         boolean;
  isTeacher:        boolean;
  isAdmin:          boolean;
  canManageContent: boolean;
  signOut:          () => Promise<void>;
  refreshProfile:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null, profile: null, loading: true, role: null,
  isMember: false, isTeacher: false, isAdmin: false, canManageContent: false,
  signOut: async () => {}, refreshProfile: async () => {},
});

// Sets or clears the sentinel cookie that middleware uses to detect a session.
// Supabase v2 stores auth in localStorage, not cookies, so the middleware
// cannot read it directly. This thin cookie bridges that gap.
function setSentinelCookie(authenticated: boolean) {
  if (authenticated) {
    document.cookie = 'sb-session=1; path=/; max-age=604800; SameSite=Lax';
  } else {
    document.cookie = 'sb-session=; path=/; max-age=0; SameSite=Lax';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSentinelCookie(!!s);
      if (s?.user?.id) {
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setSentinelCookie(!!s);
        if (s?.user?.id) {
          await fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Clear immediately — don't wait for onAuthStateChange to race the redirect
    setSentinelCookie(false);
    setSession(null);
    setProfile(null);
    // Send the user back to whichever login matches where they were
    const inAdminArea =
      router.pathname.startsWith('/admin') ||
      router.pathname.startsWith('/control-panel');
    router.push(inAdminArea ? '/auth/login' : '/member/login');
  }, [router]);

  const role             = profile?.role as UserRole | null;
  const isMember         = !!role && ['member', 'leader', 'teacher', 'admin', 'pastor'].includes(role);
  const isTeacher        = !!role && ['teacher', 'admin', 'pastor', 'leader'].includes(role);
  const isAdmin          = !!role && ['admin', 'pastor'].includes(role);
  const canManageContent = !!role && ['media', 'admin', 'pastor'].includes(role);

  return (
    <AuthContext.Provider value={{
      session, profile, loading, role,
      isMember, isTeacher, isAdmin, canManageContent,
      signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
