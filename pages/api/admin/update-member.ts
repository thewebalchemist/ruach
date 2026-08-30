// pages/api/admin/update-member.ts
// Admin edit of a member profile, including the member number — which,
// per the membership pipeline requirement, is auto-assigned on graduation
// (see graduate-connect-student.ts / verify-legacy-request.ts) but must
// remain editable by admins afterward. No route previously touched
// profiles.member_id outside those two grant flows (see AUDIT_REPORT.md).
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveAdminAuth, hasPermission } from '@/lib/admin-auth';
import { parseBody, sanitizeName } from '@/lib/validation';
import { toE164, normalizePhone, isValidKenyanPhone } from '@/lib/phone';
import { z } from 'zod';

const updateMemberSchema = z.object({
  memberId:      z.string().trim().max(20).nullable().optional(),
  firstName:     z.string().trim().min(1).max(100).optional(),
  lastName:      z.string().trim().min(1).max(100).optional(),
  phone:         z.string().trim().optional(),
  gender:        z.enum(['male', 'female']).nullable().optional(),
  dateOfBirth:   z.string().nullable().optional(),
  address:       z.string().trim().max(500).nullable().optional(),
  occupation:    z.string().trim().max(200).nullable().optional(),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced']).nullable().optional(),
  role:          z.enum(['student', 'member', 'leader', 'teacher', 'admin', 'pastor']).optional(),
  status:        z.enum(['pending', 'active', 'suspended', 'inactive']).optional(),
  crosspointZone: z.enum(['south', 'east', 'north', 'west']).nullable().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', ['PATCH']); return res.status(405).json({ error: 'Method not allowed' }); }

  const ctx = await resolveAdminAuth(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasPermission(ctx, 'members', 'edit')) return res.status(403).json({ error: 'Forbidden' });

  const memberIdParam = req.query.id;
  if (typeof memberIdParam !== 'string') return res.status(400).json({ error: 'Missing member id' });

  const parsed = parseBody(updateMemberSchema, req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const body = parsed.data;

  // Editing role to admin/pastor is a privilege-escalation-adjacent action —
  // require it explicitly, not folded silently into a generic profile PATCH
  // by a caller who only holds members.edit but not users.manage.
  if (body.role && ['admin', 'pastor'].includes(body.role) && !hasPermission(ctx, 'users', 'manage')) {
    return res.status(403).json({ error: 'Granting admin/pastor role requires the users.manage permission' });
  }

  if (body.phone) {
    const normalized = normalizePhone(body.phone);
    if (!isValidKenyanPhone(normalized)) return res.status(400).json({ error: 'Invalid phone number' });
  }

  const update: Record<string, unknown> = {};
  if (body.memberId !== undefined)      update.member_id = body.memberId?.trim() || null;
  if (body.firstName !== undefined)     update.first_name = sanitizeName(body.firstName);
  if (body.lastName !== undefined)      update.last_name = sanitizeName(body.lastName);
  if (body.phone !== undefined)         update.phone = toE164(normalizePhone(body.phone));
  if (body.gender !== undefined)        update.gender = body.gender;
  if (body.dateOfBirth !== undefined)   update.date_of_birth = body.dateOfBirth;
  if (body.address !== undefined)       update.address = body.address;
  if (body.occupation !== undefined)    update.occupation = body.occupation;
  if (body.maritalStatus !== undefined) update.marital_status = body.maritalStatus;
  if (body.role !== undefined)          update.role = body.role;
  if (body.status !== undefined)        update.status = body.status;
  if (body.crosspointZone !== undefined) update.crosspoint_zone = body.crosspointZone;
  update.updated_at = new Date().toISOString();

  if (update.member_id) {
    const { data: existing } = await supabaseAdmin
      .from('profiles').select('id').eq('member_id', update.member_id).neq('id', memberIdParam).maybeSingle();
    if (existing) return res.status(409).json({ error: 'That member number is already in use' });
  }

  const { error } = await supabaseAdmin.from('profiles').update(update).eq('id', memberIdParam);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
}
