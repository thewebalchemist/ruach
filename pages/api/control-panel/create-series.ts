import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabaseAdmin.from('profiles').select('role, status').eq('id', user.id).single();
  if (!profile || !['admin', 'pastor', 'media'].includes(profile.role) || profile.status === 'suspended') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await supabaseAdmin
    .from('series')
    .insert({ title: title.trim(), slug })
    .select('id, title')
    .single();

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json(data);
}
