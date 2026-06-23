import type { NextApiRequest, NextApiResponse } from 'next';
import { getCallerProfile, supabaseAdmin } from '@/lib/api-auth';

const ALLOWED = ['admin', 'pastor', 'media'];

// Disable Next.js body parser so we can read the raw body
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const profile = await getCallerProfile(req, ALLOWED);
  if (!profile) return res.status(403).json({ error: 'Forbidden' });

  const { file_base64, file_name, content_type } = req.body;
  if (!file_base64 || !file_name) {
    return res.status(400).json({ error: 'file_base64 and file_name are required' });
  }

  const buffer = Buffer.from(file_base64, 'base64');
  const ext = file_name.split('.').pop() || 'jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('church-photos')
    .upload(uniqueName, buffer, {
      contentType: content_type || 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    return res.status(400).json({ error: uploadError.message });
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('church-photos')
    .getPublicUrl(uniqueName);

  return res.status(200).json({ url: urlData.publicUrl });
}
