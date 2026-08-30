// pages/api/admin/roles/index.ts
// GET  — list all admin roles with their permission + member counts
// POST — create a new (non-system) role
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveAdminAuth, hasPermission } from '@/lib/admin-auth';
import { nameSchema, parseBody } from '@/lib/validation';
import { z } from 'zod';

const createRoleSchema = z.object({
  name: nameSchema,
  description: z.string().trim().max(500).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await resolveAdminAuth(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasPermission(ctx, 'settings', 'manage')) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const { data: roles, error } = await supabaseAdmin
      .from('admin_roles')
      .select('id, name, description, is_system_role, created_at, admin_role_permissions(count), user_admin_roles(count)')
      .order('is_system_role', { ascending: false })
      .order('name');

    if (error) return res.status(500).json({ error: error.message });

    const shaped = (roles ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystemRole: r.is_system_role,
      createdAt: r.created_at,
      permissionCount: r.admin_role_permissions?.[0]?.count ?? 0,
      memberCount: r.user_admin_roles?.[0]?.count ?? 0,
    }));

    return res.status(200).json({ roles: shaped });
  }

  if (req.method === 'POST') {
    const parsed = parseBody(createRoleSchema, req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });

    const { data, error } = await supabaseAdmin
      .from('admin_roles')
      .insert({ name: parsed.data.name, description: parsed.data.description ?? null, is_system_role: false })
      .select('id')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ id: data.id });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
