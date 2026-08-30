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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);

    // Only admin/pastor ever reach /admin, so only fetch permissions for
    // them — one RPC call per session, not per render (see lib/admin-auth.ts
    // for the server-side equivalent used by API routes).
    if (data?.role === 'admin' || data?.role === 'pastor') {
      const { data: rows } = await supabase.rpc('get_my_admin_permissions');
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
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user?.id) {
          await fetchProfile(s.user.id);
        } else {
          setProfile(null);
          setPermissions([]);
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
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
