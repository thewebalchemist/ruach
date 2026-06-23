import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor', 'leader', 'teacher'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  /* GET — list all procurement requests */
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('procurement_requests')
      .select('*, requester:profiles!requested_by(first_name, last_name), approver:profiles!approved_by(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  /* POST — create a new request */
  if (req.method === 'POST') {
    const { title, description, category, amount_estimated, vendor, priority, department_id, crosspoint_id, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { data, error } = await supabaseAdmin
      .from('procurement_requests')
      .insert({
        title,
        description: description || null,
        category: category || 'general',
        amount_estimated: amount_estimated || null,
        vendor: vendor || null,
        priority: priority || 'medium',
        department_id: department_id || null,
        crosspoint_id: crosspoint_id || null,
        notes: notes || null,
        requested_by: profile.id,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  /* PUT — update a request (approve / reject / edit) */
  if (req.method === 'PUT') {
    const { id, ...fields } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });

    // If approving or rejecting, add approver info
    if (fields.status === 'approved' || fields.status === 'rejected') {
      if (!['admin', 'pastor'].includes(profile.role)) {
        return res.status(403).json({ error: 'Only admin/pastor can approve or reject' });
      }
      fields.approved_by = profile.id;
      fields.approved_at = new Date().toISOString();
    }

    fields.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('procurement_requests')
      .update(fields)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  /* DELETE — remove a request */
  if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'ID required' });

    const { error } = await supabaseAdmin
      .from('procurement_requests')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
