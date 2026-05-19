import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('stream_settings')
        .select('*')
        .single();

      if (error) throw error;

      return res.status(200).json({
        url: data.live_url,
        isLive: data.is_live,
        defaultYoutubeUrl: data.default_youtube_url,
        updatedAt: data.updated_at,
      });
    } catch (error) {
      console.error('Error fetching stream:', error);
      return res.status(500).json({ message: 'Error fetching stream data' });
    }
  } else if (req.method === 'POST') {
    try {
      const { url, isLive, defaultYoutubeUrl } = req.body;

      const { data, error } = await supabase
        .from('stream_settings')
        .update({
          live_url: url || '',
          is_live: isLive || false,
          default_youtube_url: defaultYoutubeUrl || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        url: data.live_url,
        isLive: data.is_live,
        defaultYoutubeUrl: data.default_youtube_url,
        updatedAt: data.updated_at,
      });
    } catch (error) {
      console.error('Error updating stream:', error);
      return res.status(500).json({ message: 'Error updating stream data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}