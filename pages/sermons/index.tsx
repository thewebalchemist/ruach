import { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { GetServerSideProps } from 'next';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';
import type { Sermon } from '@/types';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

interface SermonsPageProps {
  sermons: Sermon[];
  page: number;
  hasMore: boolean;
}

function getYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1] ?? '';
}

function getThumb(s: Sermon): string {
  if (s.thumbnail_url) return s.thumbnail_url;
  if (s.youtube_url) {
    const id = getYouTubeId(s.youtube_url);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return '/church-photos/IMG_1716.jpg';
}

function SermonCard({ sermon }: { sermon: Sermon }) {
  const thumb = getThumb(sermon);
  const seriesTitle = (sermon.series as { title?: string } | null)?.title;
  return (
    <Link href={`/sermons/${sermon.slug}`} className="group flex-shrink-0 w-[260px] md:w-[300px]">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1A1E28] mb-3">
        <img src={thumb} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-[#BF0A30]/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
      {seriesTitle && <span className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest">{seriesTitle}</span>}
      <h3 className="text-white font-bold text-sm leading-snug mt-0.5 group-hover:text-[#BF0A30] transition-colors line-clamp-2">{sermon.title}</h3>
      <p className="text-[#8B95A8] text-xs mt-1">{sermon.preacher} · {new Date(sermon.service_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
    </Link>
  );
}

export default function SermonsPage({ sermons, page, hasMore }: SermonsPageProps) {
  const [search, setSearch] = useState('');
  const featured = sermons[0] ?? null;
  const rest = sermons.slice(1);

  const filtered = search
    ? sermons.filter((s) => {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.preacher.toLowerCase().includes(q);
      })
    : null;

  return (
    <Layout title="Sermons">
      <div className="min-h-screen bg-[#0A0C10]">

        {/* FEATURED SERMON */}
        {featured && !search && (
          <section className="relative w-full overflow-hidden" style={{ aspectRatio: '21/9', maxHeight: '520px' }}>
            <img src={getThumb(featured)} alt={featured.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
            <div className="absolute bottom-8 left-6 md:left-12 max-w-xl">
              <span className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest" style={H}>Latest Sermon</span>
              <h1 className="text-2xl md:text-4xl font-black text-white mb-2 mt-1 leading-tight" style={H}>{featured.title}</h1>
              <p className="text-[#8B95A8] mb-4 text-sm">{featured.preacher} · {new Date(featured.service_date).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <Link href={`/sermons/${featured.slug}`} className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all" style={H}>
                <Play className="w-4 h-4 fill-white" /> Watch Now
              </Link>
            </div>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Search */}
          <div className="mb-10 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sermons..."
              className="w-full bg-[#1A1E28] border border-white/10 text-white placeholder-[#8B95A8] rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-[#BF0A30] transition-colors"
            />
          </div>

          {/* Search results */}
          {filtered && (
            filtered.length === 0 ? (
              <p className="text-[#8B95A8] text-center py-16">No sermons match your search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((s) => <SermonCard key={s.id} sermon={s} />)}
              </div>
            )
          )}

          {/* Rows when not searching */}
          {!filtered && (
            <>
              {/* Latest sermons horizontal scroll */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-white" style={H}>Latest Sermons</h2>
                  <Link href="/sermons?page=2" className="text-[#8B95A8] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1" style={H}>
                    See All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {rest.slice(0, 10).map((s) => <SermonCard key={s.id} sermon={s} />)}
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {!filtered && (page > 1 || hasMore) && (
            <div className="flex gap-3 justify-center mt-8">
              {page > 1 && <Link href={`/sermons?page=${page - 1}`} className="border border-white/20 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all" style={H}>← Previous</Link>}
              {hasMore && <Link href={`/sermons?page=${page + 1}`} className="border border-white/20 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all" style={H}>Next →</Link>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = Math.max(1, parseInt((query.page as string) || '1', 10));
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  try {
    const { data } = await supabase
      .from('sermons')
      .select('*, series(title, slug)')
      .order('service_date', { ascending: false })
      .range(from, from + pageSize);

    const sermons = data ?? [];
    return {
      props: {
        sermons,
        page,
        hasMore: sermons.length === pageSize + 1,
      },
    };
  } catch {
    return { props: { sermons: [], page, hasMore: false } };
  }
};
