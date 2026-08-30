// pages/api/admin/roles/[id]/assign.ts
// POST   — grant a role to a user (optionally scoped to one department)
// DELETE — revoke a grant (?grantId=...)
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveAdminAuth, hasPermission } from '@/lib/admin-auth';
import { uuidSchema, parseBody } from '@/lib/validation';
import { z } from 'zod';

const assignSchema = z.object({
  userId: uuidSchema,
  departmentId: z.string().trim().nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await resolveAdminAuth(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasPermission(ctx, 'settings', 'manage')) return res.status(403).json({ error: 'Forbidden' });

  const idResult = uuidSchema.safeParse(req.query.id);
  if (!idResult.success) return res.status(400).json({ error: 'Invalid role id' });
  const roleId = idResult.data;

  if (req.method === 'POST') {
    const parsed = parseBody(assignSchema, req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });

    const { error } = await supabaseAdmin.from('user_admin_roles').insert({
      user_id: parsed.data.userId,
      role_id: roleId,
      department_id: parsed.data.departmentId ?? null,
      granted_by: ctx.userId,
    });

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'User already holds this role at this scope' });
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const grantIdResult = uuidSchema.safeParse(req.query.grantId);
    if (!grantIdResult.success) return res.status(400).json({ error: 'grantId is required' });

    const { error } = await supabaseAdmin
      .from('user_admin_roles')
      .delete()
      .eq('id', grantIdResult.data)
      .eq('role_id', roleId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
