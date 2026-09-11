// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';

export type UserRole = 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor' | 'media';

export interface AdminPermission {
  moduleKey:    string;
  action:       string;
  departmentId: string | null;
}

interface AuthContextValue {
  session:          Session | null;
  profile:          Profile | null;
  loading:          boolean;
  role:             UserRole | null;
  isMember:         boolean;
  isTeacher:        boolean;
  isAdmin:          boolean;
  canManageContent: boolean;
  permissions:      AdminPermission[];
  hasPermission:    (moduleKey: string, action: string) => boolean;
  signOut:          () => Promise<void>;
  refreshProfile:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null, profile: null, loading: true, role: null,
  isMember: false, isTeacher: false, isAdmin: false, canManageContent: false,
  permissions: [], hasPermission: () => false,
  signOut: async () => {}, refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    // Fired in parallel rather than profile-then-permissions: the RPC only
    // returns the caller's own permissions (empty for non-admins), and the
    // sequential version added a full extra round trip to every admin
    // dashboard load.
    const [{ data }, { data: rows }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.rpc('get_my_admin_permissions'),
    ]);
    setProfile(data ?? null);

    if (data?.role === 'admin' || data?.role === 'pastor') {
      setPermissions((rows ?? []).map((r: { module_key: string; action: string; department_id: string | null }) => ({
        moduleKey: r.module_key,
        action: r.action,
        departmentId: r.department_id,
      })));
    } else {
      setPermissions([]);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await fetchProfile(session.user.id);
  }, [session, fetchProfile]);

  useEffect(() => {
    let cancelled = false;
    // The user id whose profile is already loaded/loading — dedupes the
    // double-fire on mount (getSession + INITIAL_SESSION event) and the
    // redundant refetches on every TOKEN_REFRESHED / tab-refocus event.
    let loadedUserId: string | null = null;

    const handleSession = (s: Session | null) => {
      if (cancelled) return;
      setSession(s);
      const uid = s?.user?.id ?? null;

      if (!uid) {
        loadedUserId = null;
        setProfile(null);
        setPermissions([]);
        setLoading(false);
        return;
      }
      if (loadedUserId === uid) {
        setLoading(false);
        return;
      }
      loadedUserId = uid;
      // Deferred via setTimeout: Supabase queries must not run inside the
      // onAuthStateChange callback itself (the client's auth state machine
      // is mid-transition there and the internal getSession the query makes
      // can hang — the "stuck loading until I clear site data" bug).
      setTimeout(() => {
        if (cancelled) return;
        fetchProfile(uid)
          .catch(() => { loadedUserId = null; }) // allow retry on next event
          .finally(() => { if (!cancelled) setLoading(false); });
      }, 0);
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => handleSession(s));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => handleSession(s),
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setPermissions([]);
    // Send the user back to whichever login page matches where they were
    const path = router.pathname;
    const loginPage =
      path.startsWith('/admin') || path.startsWith('/control-panel') ? '/auth/login' :
      path.startsWith('/connect')                                    ? '/connect' :
      path.startsWith('/discipleship')                                ? '/discipleship' :
      path.startsWith('/crosspoint')                                  ? '/crosspoint' :
      '/member/login';
    router.push(loginPage);
  }, [router]);

  const role             = profile?.role as UserRole | null;
  const isMember         = !!role && ['member', 'leader', 'teacher', 'admin', 'pastor'].includes(role);
  const isTeacher        = !!role && ['teacher', 'admin', 'pastor', 'leader'].includes(role);
  const isAdmin          = !!role && ['admin', 'pastor'].includes(role);
  const canManageContent = !!role && ['media', 'admin', 'pastor'].includes(role);

  // Pastor keeps the same unconditional trust is_admin()/has_permission()
  // give it server-side — mirrors lib/admin-auth.ts's hasPermission().
  const hasPermission = useCallback((moduleKey: string, action: string) => {
    if (role === 'pastor') return true;
    return permissions.some(p => p.moduleKey === moduleKey && p.action === action);
  }, [role, permissions]);

  return (
    <AuthContext.Provider value={{
      session, profile, loading, role,
      isMember, isTeacher, isAdmin, canManageContent,
      permissions, hasPermission,
      signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
