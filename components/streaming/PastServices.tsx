import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Sermon } from '@/types';
import { formatDateShort, getYouTubeThumbnail } from '@/lib/utils';

export default function PastServices() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('service_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Past Services</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Past Services</h3>
        <Link
          href="/sermons"
          className="text-[#BF0A30] text-sm font-medium hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {sermons.map((sermon) => (
          <PastServiceCard key={sermon.id} sermon={sermon} />
        ))}

        {sermons.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No past services available yet.
          </p>
        )}
      </div>
    </div>
  );
}

function PastServiceCard({ sermon }: { sermon: Sermon }) {
  const [imageError, setImageError] = useState(false);
  const thumbnailUrl = sermon.thumbnail_url || getYouTubeThumbnail(sermon.youtube_url, 'mq');
  const fallbackUrl = getYouTubeThumbnail(sermon.youtube_url, 'default');

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="flex gap-3 p-3 rounded-xl bg-white dark:bg-[#1a1e28] hover:bg-gray-100 dark:hover:bg-[#232f48] border border-gray-200 dark:border-gray-800 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-800 shrink-0">
        <img
          src={(imageError ? fallbackUrl : thumbnailUrl) ?? ''}
          alt={sermon.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {sermon.duration_seconds && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">
            {Math.floor(sermon.duration_seconds / 60)}:{String(sermon.duration_seconds % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-[#BF0A30] transition-colors">
          {sermon.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {sermon.preacher}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDateShort(sermon.service_date)}
        </p>
      </div>
    </Link>
  );
}