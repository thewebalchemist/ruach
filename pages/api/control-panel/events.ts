import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor', 'media'];

// Regenerate the statically-cached pages that list events so a new/edited event
// shows up right away instead of after the 5-min ISR window. Best-effort.
async function refreshEventPages(res: NextApiResponse) {
  try { await res.revalidate('/'); } catch { /* page not cached yet — ignore */ }
}

// Columns added by supabase/events_upgrades.sql. If that migration hasn't run
// yet, saving would fail on the unknown column — so on that specific error we
// strip them and retry, keeping event saving working either way.
const EXTENDED_COLS = ['map_url', 'link_url', 'link_label'];
function isMissingColumn(msg?: string) {
  return !!msg && (/column .* does not exist/i.test(msg) || EXTENDED_COLS.some((c) => msg.includes(c)));
}
async function writeEvent(op: 'insert' | 'update', row: Record<string, unknown>, id?: number) {
  const run = (payload: Record<string, unknown>) =>
    op === 'insert'
      ? supabaseAdmin.from('events').insert(payload).select().single()
      : supabaseAdmin.from('events').update(payload).eq('id', id!).select().single();
  let { data, error } = await run(row);
  if (error && isMissingColumn(error.message)) {
    const base = { ...row };
    EXTENDED_COLS.forEach((c) => delete base[c]);
    ({ data, error } = await run(base));
  }
  return { data, error };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'POST') {
    const { title, event_date, end_date, start_time, end_time, location, map_url, description, image_url, link_url, link_label, is_public, chatbot_enabled, category } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'Title and date required' });

    const { data, error } = await writeEvent('insert', {
      title, event_date, end_date: end_date || null, start_time: start_time || null,
      end_time: end_time || null, location: location || null, map_url: map_url || null,
      description: description || null, image_url: image_url || null,
      link_url: link_url || null, link_label: link_label || null,
      is_public: is_public ?? true, chatbot_enabled: chatbot_enabled ?? true,
      category: category || 'church-wide',
    });

    if (error) return res.status(400).json({ error: error.message });
    await refreshEventPages(res);
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id, ...fields } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { data, error } = await writeEvent('update', fields, id);
    if (error) return res.status(400).json({ error: error.message });
    await refreshEventPages(res);
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    await refreshEventPages(res);
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
