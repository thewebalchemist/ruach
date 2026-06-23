import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor', 'media'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'POST') {
    const { title, event_date, end_date, start_time, end_time, location, description, image_url, is_public, chatbot_enabled, category } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'Title and date required' });

    const { data, error } = await supabaseAdmin.from('events').insert({
      title, event_date, end_date: end_date || null, start_time: start_time || null,
      end_time: end_time || null, location: location || null, description: description || null,
      image_url: image_url || null, is_public: is_public ?? true, chatbot_enabled: chatbot_enabled ?? true,
      category: category || 'church-wide',
    }).select().single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id, ...fields } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { data, error } = await supabaseAdmin.from('events').update(fields).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
