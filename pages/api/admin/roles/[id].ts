// pages/api/admin/roles/[id].ts
// GET   — one role, its granted permission ids, and current member grants
// PATCH — update name/description
// DELETE — remove a non-system role
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveAdminAuth, hasPermission } from '@/lib/admin-auth';
import { nameSchema, uuidSchema, parseBody } from '@/lib/validation';
import { z } from 'zod';

const updateRoleSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await resolveAdminAuth(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasPermission(ctx, 'settings', 'manage')) return res.status(403).json({ error: 'Forbidden' });

  const idResult = uuidSchema.safeParse(req.query.id);
  if (!idResult.success) return res.status(400).json({ error: 'Invalid role id' });
  const roleId = idResult.data;

  if (req.method === 'GET') {
    const { data: role, error } = await supabaseAdmin
      .from('admin_roles')
      .select('id, name, description, is_system_role, created_at')
      .eq('id', roleId)
      .single();
    if (error || !role) return res.status(404).json({ error: 'Role not found' });

    const { data: grantedPerms } = await supabaseAdmin
      .from('admin_role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);

    const { data: members } = await supabaseAdmin
      .from('user_admin_roles')
      .select('id, user_id, department_id, created_at, profiles(first_name, last_name, email)')
      .eq('role_id', roleId);

    return res.status(200).json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystemRole: role.is_system_role,
      },
      permissionIds: (grantedPerms ?? []).map(p => p.permission_id),
      members: (members ?? []).map((m: any) => ({
        grantId: m.id,
        userId: m.user_id,
        departmentId: m.department_id,
        name: `${m.profiles?.first_name ?? ''} ${m.profiles?.last_name ?? ''}`.trim(),
        email: m.profiles?.email,
        grantedAt: m.created_at,
      })),
    });
  }

  if (req.method === 'PATCH') {
    const parsed = parseBody(updateRoleSchema, req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });

    const { error } = await supabaseAdmin.from('admin_roles').update({
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', roleId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { data: role } = await supabaseAdmin.from('admin_roles').select('is_system_role').eq('id', roleId).single();
    if (!role) return res.status(404).json({ error: 'Role not found' });
    if (role.is_system_role) return res.status(400).json({ error: 'System roles cannot be deleted' });

    const { error } = await supabaseAdmin.from('admin_roles').delete().eq('id', roleId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
