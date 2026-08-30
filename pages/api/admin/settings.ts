import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('church_info')
      .select('*');

    if (error) return res.status(400).json({ error: error.message });

    // Convert array of key-value pairs into an object
    const settings: Record<string, string> = {};
    if (data) {
      for (const row of data) {
        settings[row.key] = row.value;
      }
    }
    return res.status(200).json(settings);
  }

  if (req.method === 'PUT') {
    const entries = req.body as Record<string, string>;
    if (!entries || typeof entries !== 'object') {
      return res.status(400).json({ error: 'Body must be an object of key-value pairs' });
    }

    const upserts = Object.entries(entries).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from('church_info')
      .upsert(upserts, { onConflict: 'key' });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}
