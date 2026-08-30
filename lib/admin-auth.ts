// lib/admin-auth.ts
// Server-side auth + permission resolution for /api/admin/** routes.
// Caching pattern ported from ivents-production's lib/api-auth.ts (30s
// in-memory TTL, keyed by bearer token) — avoids a Bearer-token verify plus
// a permissions query on every single admin API call. Unlike ivents, there's
// no multi-org resolution here (this app is single-tenant) and no fixed
// requireRole()/role-map — permission checks are fully dynamic (Batch 3,
// see execution plan Appendix A).
import type { NextApiRequest } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface AdminPermission {
  moduleKey:    string;
  action:       string;
  departmentId: string | null;
}

export interface AdminAuthContext {
  userId:      string;
  profileRole: string;
  permissions: AdminPermission[];
}

const CACHE_TTL_MS = 30_000;
const authCache = new Map<string, { ctx: AdminAuthContext; expiresAt: number }>();

function getBearerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization ?? '';
  const token = header.replace('Bearer ', '');
  return token || null;
}

/** Resolves the caller's identity + flattened permission set from a Bearer
 * token. Returns null if the token is missing/invalid — callers should
 * respond 401. Does NOT check any specific permission — call `hasPermission`
 * on the result for that. */
export async function resolveAdminAuth(req: NextApiRequest): Promise<AdminAuthContext | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const cached = authCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.ctx;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  if (!profile) return null;

  const { data: permRows } = await supabaseAdmin.rpc('get_admin_permissions_for_user', { p_user_id: user.id });

  const ctx: AdminAuthContext = {
    userId: user.id,
    profileRole: profile.role,
    permissions: (permRows ?? []).map((r: { module_key: string; action: string; department_id: string | null }) => ({
      moduleKey: r.module_key,
      action: r.action,
      departmentId: r.department_id,
    })),
  };

  authCache.set(token, { ctx, expiresAt: Date.now() + CACHE_TTL_MS });
  return ctx;
}

export function invalidateAdminAuthCache(token: string): void {
  authCache.delete(token);
}

/** Mirrors the SQL has_permission()'s logic: an explicit grant, or an
 * unconditional pastor pass (never locked out by an empty/misconfigured
 * role table). */
export function hasPermission(ctx: AdminAuthContext, moduleKey: string, action: string): boolean {
  if (ctx.profileRole === 'pastor') return true;
  return ctx.permissions.some(p => p.moduleKey === moduleKey && p.action === action);
}

/** Department ids this grant restricts the caller to for a given permission,
 * or null if unrestricted (pastor, or holds a churchwide grant). Callers on
 * department-shaped resources should filter by this when not null. */
export function permissionDepartments(ctx: AdminAuthContext, moduleKey: string, action: string): string[] | null {
  if (ctx.profileRole === 'pastor') return null;
  const grants = ctx.permissions.filter(p => p.moduleKey === moduleKey && p.action === action);
  if (grants.some(g => g.departmentId === null)) return null;
  return grants.map(g => g.departmentId!).filter(Boolean);
}
