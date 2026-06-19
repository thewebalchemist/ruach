import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Play, ArrowLeft, Calendar, User } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';
import { Series, Sermon } from '@/types';
import { formatDateShort, getYouTubeThumbnail } from '@/lib/utils';

interface SingleSeriesPageProps {
  series: Series | null;
  sermons: Sermon[];
}

export default function SingleSeriesPage({ series, sermons }: SingleSeriesPageProps) {
  if (!series) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Series Not Found</h1>
          <Link href="/series" className="text-[#BF0A30] hover:underline">
            ← Back to All Series
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{series.title} | RuachOnline</title>
        <meta name="description" content={series.description || `Watch the ${series.title} sermon series`} />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            {series.image_url ? (
              <img
                src={series.image_url}
                alt={series.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#BF0A30] to-[#9a0826]" />
            )}
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-[1440px] mx-auto px-4 lg:px-10 flex items-end pb-10 md:pb-16">
            <div className="max-w-2xl space-y-4">
              <Link
                href="/series"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                All Series
              </Link>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#BF0A30]/20 text-[#BF0A30] text-xs font-bold uppercase tracking-wider border border-[#BF0A30]/30">
                  {series.year || 'Series'}
                </span>
                <span className="text-gray-400 text-sm">
                  {sermons.length} {sermons.length === 1 ? 'sermon' : 'sermons'}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {series.title}
              </h1>

              {series.description && (
                <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                  {series.description}
                </p>
              )}

              {sermons.length > 0 && (
                <div className="flex items-center gap-4 pt-4">
                  <Link
                    href={`/sermons/${sermons[0].slug}`}
                    className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-xl"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    Play
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sermons List */}
        <div className="bg-gray-50 dark:bg-[#0a0c10] pb-20">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Episodes
            </h2>

            <div className="space-y-4">
              {sermons.map((sermon, index) => (
                <SermonListItem
                  key={sermon.id}
                  sermon={sermon}
                  episodeNumber={sermon.series_part || index + 1}
                />
              ))}
            </div>

            {sermons.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">No sermons in this series yet.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

function SermonListItem({ sermon, episodeNumber }: { sermon: Sermon; episodeNumber: number }) {
  const [imageError, setImageError] = useState(false);
  const thumbnailUrl = sermon.thumbnail_url || getYouTubeThumbnail(sermon.youtube_url, 'hq');
  const fallbackUrl = getYouTubeThumbnail(sermon.youtube_url, 'mq');

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group flex flex-col md:flex-row gap-4 md:gap-6 p-4 rounded-2xl bg-white dark:bg-[#1a1e28] hover:bg-gray-100 dark:hover:bg-[#232f48] border border-gray-200 dark:border-gray-800 transition-all"
    >
      {/* Episode Number */}
      <div className="hidden md:flex items-center justify-center w-12 text-2xl font-bold text-gray-400 dark:text-gray-600">
        {episodeNumber}
      </div>

      {/* Thumbnail */}
      <div className="relative w-full md:w-48 h-32 md:h-28 rounded-xl overflow-hidden bg-gray-800 shrink-0">
        <img
          src={(imageError ? fallbackUrl : thumbnailUrl) ?? ''}
          alt={sermon.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl">
            <Play className="w-5 h-5 text-[#0a0c10] fill-current ml-0.5" />
          </div>
        </div>
        {/* Duration Badge */}
        {sermon.duration_seconds && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
            {Math.floor(sermon.duration_seconds / 60)}:{String(sermon.duration_seconds % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="md:hidden text-sm text-gray-500 dark:text-gray-400 mb-1">
              Episode {episodeNumber}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-[#BF0A30] transition-colors line-clamp-1">
              {sermon.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {sermon.preacher}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateShort(sermon.service_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Preview */}
        {sermon.description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {sermon.description.replace(/[#*_]/g, '').substring(0, 200)}
          </p>
        )}

        {/* Tags */}
        {sermon.tags && sermon.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {sermon.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#BF0A30]/10 text-[#BF0A30] text-xs font-medium rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    // Fetch series
    const { data: series } = await supabase
      .from('series')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!series) {
      return { props: { series: null, sermons: [] } };
    }

    // Fetch sermons in this series
    const { data: sermons } = await supabase
      .from('sermons')
      .select('*')
      .eq('series_id', series.id)
      .order('series_part', { ascending: true, nullsFirst: false })
      .order('service_date', { ascending: true });

    return {
      props: {
        series,
        sermons: sermons || [],
      },
    };
  } catch (error) {
    console.error('Error fetching series:', error);
    return { props: { series: null, sermons: [] } };
  }
};