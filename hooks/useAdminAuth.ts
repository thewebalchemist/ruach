import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

interface AuthState {
  loading: boolean;
  session: { access_token: string } | null;
  profile: { id: string; role: string } | null;
}

/**
 * Hook for admin pages: checks session + role.
 * Redirects to /auth/login if not authed or role not in allowedRoles.
 */
export function useAdminAuth(allowedRoles: string[] = ['admin', 'pastor', 'leader', 'teacher', 'media']) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ loading: true, session: null, profile: null });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (cancelled) return;

      if (!profile || !allowedRoles.includes(profile.role)) {
        router.push('/');
        return;
      }

      setState({
        loading: false,
        session: { access_token: session.access_token },
        profile: { id: profile.id, role: profile.role },
      });
    }
    check();
    return () => { cancelled = true; };
  }, []);

  /** Helper: returns headers with Bearer token for API calls */
  function authHeaders(): Record<string, string> {
    return state.session
      ? { Authorization: `Bearer ${state.session.access_token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  return { ...state, authHeaders };
}
