import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Play, Layers } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';
import { Series } from '@/types';

interface SeriesPageProps {
  allSeries: Series[];
}

export default function SeriesPage({ allSeries }: SeriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSeries = allSeries.filter((series) =>
    series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    series.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Sermon Series | RuachOnline</title>
        <meta name="description" content="Browse all sermon series from Ruach Church" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0c10] pt-8 pb-20">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-[#BF0A30]" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Sermon Series
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {allSeries.length} series available
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search series..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1e28] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                />
              </div>
            </div>

            {/* Series Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredSeries.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400">No series found.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

function SeriesCard({ series }: { series: Series }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/series/${series.slug}`} className="group">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 card-hover-scale shadow-lg">
        {series.image_url && !imageError ? (
          <img
            src={series.image_url}
            alt={series.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#BF0A30] to-[#9a0826] flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {series.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-7 h-7 text-[#0a0c10] fill-current ml-1" />
          </div>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-sm md:text-base line-clamp-2 mb-1">
            {series.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            {series.year && <span>{series.year}</span>}
            {series.sermon_count !== undefined && (
              <>
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span>{series.sermon_count} sermons</span>
              </>
            )}
          </div>
        </div>

        {/* Year Badge */}
        {series.year && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded">
            {series.year}
          </div>
        )}
      </div>
    </Link>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data: seriesData } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false });

    // Get sermon counts
    const seriesWithCounts = await Promise.all(
      (seriesData || []).map(async (series) => {
        const { count } = await supabase
          .from('sermons')
          .select('*', { count: 'exact', head: true })
          .eq('series_id', series.id);
        return { ...series, sermon_count: count || 0 };
      })
    );

    return {
      props: {
        allSeries: seriesWithCounts,
      },
    };
  } catch (error) {
    console.error('Error fetching series:', error);
    return { props: { allSeries: [] } };
  }
};