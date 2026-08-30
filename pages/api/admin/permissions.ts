// pages/api/admin/permissions.ts
// GET — the full seeded reference permission list, for rendering the
// roles/[id] matrix editor's row/column shape.
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveAdminAuth, hasPermission } from '@/lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', ['GET']); return res.status(405).json({ error: 'Method not allowed' }); }

  const ctx = await resolveAdminAuth(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasPermission(ctx, 'settings', 'manage')) return res.status(403).json({ error: 'Forbidden' });

  const { data, error } = await supabaseAdmin
    .from('admin_permissions')
    .select('id, module_key, action, description')
    .order('module_key')
    .order('action');

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({
    permissions: (data ?? []).map(p => ({ id: p.id, moduleKey: p.module_key, action: p.action, description: p.description })),
  });
}
