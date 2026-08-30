// pages/api/admin/roles/[id]/permissions.ts
// PUT — replace a role's full permission set in one call (delete-then-insert)
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveAdminAuth, hasPermission } from '@/lib/admin-auth';
import { uuidSchema, parseBody } from '@/lib/validation';
import { z } from 'zod';

const bodySchema = z.object({ permissionIds: z.array(uuidSchema) });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') { res.setHeader('Allow', ['PUT']); return res.status(405).json({ error: 'Method not allowed' }); }

  const ctx = await resolveAdminAuth(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasPermission(ctx, 'settings', 'manage')) return res.status(403).json({ error: 'Forbidden' });

  const idResult = uuidSchema.safeParse(req.query.id);
  if (!idResult.success) return res.status(400).json({ error: 'Invalid role id' });
  const roleId = idResult.data;

  const parsed = parseBody(bodySchema, req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const { error: delErr } = await supabaseAdmin.from('admin_role_permissions').delete().eq('role_id', roleId);
  if (delErr) return res.status(500).json({ error: delErr.message });

  if (parsed.data.permissionIds.length > 0) {
    const { error: insErr } = await supabaseAdmin.from('admin_role_permissions').insert(
      parsed.data.permissionIds.map(permission_id => ({ role_id: roleId, permission_id })),
    );
    if (insErr) return res.status(500).json({ error: insErr.message });
  }

  return res.status(200).json({ success: true });
}
