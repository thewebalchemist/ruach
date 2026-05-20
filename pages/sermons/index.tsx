import { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Search, X } from 'lucide-react';
import { GetServerSideProps } from 'next';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';
import type { Sermon } from '@/types';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

/* ─── Hardcoded featured sermons ────────────────────────────────── */
const FEATURED_VIDEOS = [
  { id: 'nznXwkJlJ44', title: 'Greater Glory', preacher: 'Ruach Tabernacle' },
  { id: 'j02RsIkJj9s', title: 'Raising Kingdom Champions', preacher: 'Ruach Tabernacle' },
  { id: '-h0OTNmAjZI', title: 'Faith That Moves Mountains', preacher: 'Ruach Tabernacle' },
  { id: 'g780BzATRpc', title: 'Walking in Purpose', preacher: 'Ruach Tabernacle' },
  { id: 'aa3HrKJLf9o', title: 'The Power of the Holy Spirit', preacher: 'Ruach Tabernacle' },
  { id: 'BRMy37ZHzX0', title: 'Kingdom Business', preacher: 'Ruach Tabernacle' },
  { id: 'Vks1fMXKMfg', title: 'Encounter With God', preacher: 'Ruach Tabernacle' },
  { id: 'yO_7r2U_hN8', title: 'Transformed by Grace', preacher: 'Ruach Tabernacle' },
  { id: 'MxfidoCebZc', title: 'Living with Intention', preacher: 'Ruach Tabernacle' },
];

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function getYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1] ?? '';
}

function getThumb(s: Sermon): string {
  if (s.thumbnail_url) return s.thumbnail_url;
  if (s.youtube_url) {
    const id = getYouTubeId(s.youtube_url);
    if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  }
  return '/church-photos/IMG_1716.jpg';
}

/* ─── Netflix-style thumbnail card ──────────────────────────────── */
function VideoCard({
  thumb,
  title,
  sub,
  active,
  onClick,
}: {
  thumb: string;
  title: string;
  sub: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex-shrink-0 w-[200px] sm:w-[240px] text-left focus:outline-none"
    >
      <div
        className={`relative aspect-video rounded-xl overflow-hidden mb-2.5 transition-all duration-300 ${
          active
            ? 'ring-2 ring-[#BF0A30] ring-offset-2 ring-offset-[#0A0C10] scale-[1.02]'
            : 'group-hover:scale-[1.03]'
        }`}
      >
        <img
          src={thumb}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-11 h-11 rounded-full bg-[#BF0A30]/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        {active && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#BF0A30] px-2 py-1 rounded-md">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider" style={H}>Playing</span>
          </div>
        )}
      </div>
      <p className="text-white text-xs font-bold leading-snug line-clamp-2" style={H}>{title}</p>
      <p className="text-[#8B95A8] text-[10px] mt-0.5">{sub}</p>
    </button>
  );
}

/* ─── Horizontal scroll row ─────────────────────────────────────── */
function SermonRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-white text-lg font-black mb-4 px-6 md:px-12" style={H}>{title}</h2>
      <div
        className="flex gap-3 overflow-x-auto pb-3 px-6 md:px-12"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Supabase sermon card ───────────────────────────────────────── */
function DbSermonCard({ sermon }: { sermon: Sermon }) {
  const thumb = getThumb(sermon);
  const seriesTitle = (sermon.series as { title?: string } | null)?.title;
  return (
    <Link href={`/sermons/${sermon.slug}`} className="group flex-shrink-0 w-[200px] sm:w-[240px]">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 group-hover:scale-[1.03] transition-transform duration-300">
        <img src={thumb} alt={sermon.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-11 h-11 rounded-full bg-[#BF0A30]/90 flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      {seriesTitle && (
        <span className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest">{seriesTitle}</span>
      )}
      <p className="text-white text-xs font-bold leading-snug mt-0.5 line-clamp-2" style={H}>{sermon.title}</p>
      <p className="text-[#8B95A8] text-[10px] mt-0.5">
        {sermon.preacher} · {new Date(sermon.service_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </Link>
  );
}

interface SermonsPageProps {
  sermons: Sermon[];
}

export default function SermonsPage({ sermons }: SermonsPageProps) {
  const [activeId, setActiveId] = useState(FEATURED_VIDEOS[0].id);
  const [search, setSearch] = useState('');

  const activeVideo = FEATURED_VIDEOS.find((v) => v.id === activeId) ?? FEATURED_VIDEOS[0];

  const filteredDb = search
    ? sermons.filter((s) => {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.preacher.toLowerCase().includes(q);
      })
    : [];

  return (
    <Layout title="Sermons — Ruach Tabernacle" description="Watch powerful messages from Ruach Tabernacle. Kingdom-focused sermons that will transform your life.">
      <div className="min-h-screen bg-[#0A0C10]">

        {/* ══════════════════════════════════════════════
            NETFLIX HERO — Featured video player
        ══════════════════════════════════════════════ */}
        <section className="relative pt-16 pb-0 bg-[#0A0C10]">
          {/* Ambient glow behind the player */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#BF0A30] pointer-events-none"
            style={{ filter: 'blur(120px)', opacity: 0.08 }}
          />

          <div className="max-w-5xl mx-auto px-6 md:px-12">
            {/* Label */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>Now Playing</p>
                <h1 className="text-white text-xl md:text-2xl font-black leading-tight" style={H}>{activeVideo.title}</h1>
              </div>
              <Link
                href="/r-media"
                className="hidden md:flex items-center gap-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
                style={H}
              >
                R-Media <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Main video embed */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl shadow-black/60 relative"
              style={{ aspectRatio: '16/9' }}
            >
              <iframe
                key={activeId}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeId}?autoplay=0&rel=0&modestbranding=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SEARCH BAR
        ══════════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto px-6 md:px-12 pt-8 pb-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B95A8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sermons…"
              className="w-full bg-[#12151C] border border-white/10 text-white placeholder-[#8B95A8] rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-[#BF0A30] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B95A8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SEARCH RESULTS
        ══════════════════════════════════════════════ */}
        {search && (
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-6">
            {filteredDb.length === 0 ? (
              <p className="text-[#8B95A8] text-sm">No sermons match &ldquo;{search}&rdquo;.</p>
            ) : (
              <>
                <p className="text-[#8B95A8] text-xs font-bold uppercase tracking-widest mb-5" style={H}>Search Results</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredDb.map((s) => <DbSermonCard key={s.id} sermon={s} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            NETFLIX ROWS — only shown when not searching
        ══════════════════════════════════════════════ */}
        {!search && (
          <div className="pt-8 pb-16">

            {/* Row 1 — Featured series (the 9 videos) */}
            <SermonRow title="Featured Messages">
              {FEATURED_VIDEOS.map((v) => (
                <VideoCard
                  key={v.id}
                  thumb={ytThumb(v.id)}
                  title={v.title}
                  sub={v.preacher}
                  active={v.id === activeId}
                  onClick={() => { setActiveId(v.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              ))}
            </SermonRow>

            {/* Row 2 — More messages (first half of FEATURED_VIDEOS reversed) */}
            <SermonRow title="More from Ruach">
              {[...FEATURED_VIDEOS].reverse().map((v) => (
                <VideoCard
                  key={`more-${v.id}`}
                  thumb={ytThumb(v.id)}
                  title={v.title}
                  sub={v.preacher}
                  active={v.id === activeId}
                  onClick={() => { setActiveId(v.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              ))}
            </SermonRow>

            {/* Row 3 — From the archive (Supabase sermons) */}
            {sermons.length > 0 && (
              <SermonRow title="From the Archive">
                {sermons.slice(0, 12).map((s) => <DbSermonCard key={s.id} sermon={s} />)}
              </SermonRow>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════
            BOTTOM CTA
        ══════════════════════════════════════════════ */}
        {!search && (
          <div className="border-t border-white/5 bg-[#0A0C10] py-14 text-center">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Every Sunday · 3 Services</p>
            <h2 className="text-white text-3xl md:text-4xl font-black mb-4" style={H}>
              Experience it<br />
              <span style={serif}>in person.</span>
            </h2>
            <p className="text-[#8B95A8] text-sm mb-8 max-w-xs mx-auto">
              Watching online is great — but there&apos;s something special about being in the room.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/new-here"
                className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all shadow-xl shadow-[rgba(191,10,48,0.35)]"
                style={H}
              >
                Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/live"
                className="flex items-center gap-2 border border-white/20 text-white hover:border-white/40 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
                style={H}
              >
                Watch Live
              </Link>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data } = await supabase
      .from('sermons')
      .select('*, series(title, slug)')
      .order('service_date', { ascending: false })
      .limit(20);
    return { props: { sermons: data ?? [] } };
  } catch {
    return { props: { sermons: [] } };
  }
};
