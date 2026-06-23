import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const profile = await getCallerProfile(req);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  const { rows } = req.body as { rows: Record<string, string>[] };
  if (!rows?.length) return res.status(400).json({ error: 'No rows provided' });

  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const row of rows) {
    const { error } = await supabaseAdmin.from('profiles').upsert({
      email: row.email?.trim().toLowerCase(),
      first_name: row.first_name?.trim() || row.firstName?.trim(),
      last_name: row.last_name?.trim() || row.lastName?.trim(),
      phone: row.phone?.trim() || null,
      role: row.role?.trim() || 'member',
      status: 'active',
      gender: row.gender?.trim() || null,
      branch: row.branch?.trim() || 'Nairobi',
    }, { onConflict: 'email' });

    if (error) { results.failed++; results.errors.push(`${row.email}: ${error.message}`); }
    else results.success++;
  }

  return res.status(200).json(results);
}
