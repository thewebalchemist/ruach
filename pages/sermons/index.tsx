import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GetServerSideProps } from 'next';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';
import type { Sermon } from '@/types';

const CATEGORIES = ['faith', 'prayer', 'family', 'leadership', 'kingdom', 'worship', 'evangelism', 'other'] as const;

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

/* ─── Hardcoded featured sermons (fallback when DB is empty) ─────── */
const FEATURED_VIDEOS = [
  { id: 'nznXwkJlJ44', title: 'Greater Glory', preacher: 'Ruach Tabernacle' },
  { id: 'j02RsIkJj9s', title: 'Raising Kingdom Champions', preacher: 'Ruach Tabernacle' },
  { id: '-h0OTNmAjZI', title: 'Faith That Moves Mountains', preacher: 'Ruach Tabernacle' },
  { id: 'g780BzATRpc', title: 'Walking in Purpose', preacher: 'Ruach Tabernacle' },
  { id: 'aa3HrKJLf9o', title: 'The Power of the Holy Spirit', preacher: 'Ruach Tabernacle' },
  { id: 'BRMy37ZHzX0', title: 'Kingdom Business', preacher: 'Ruach Tabernacle' },
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

/* ─── Netflix Hero Slider ────────────────────────────────────────── */
type SlideItem =
  | { kind: 'db'; sermon: Sermon }
  | { kind: 'yt'; video: typeof FEATURED_VIDEOS[0] };

function HeroSlider({ sermons, fallback }: { sermons: Sermon[]; fallback: typeof FEATURED_VIDEOS }) {
  const items: SlideItem[] = sermons.length > 0
    ? sermons.slice(0, 6).map(s => ({ kind: 'db' as const, sermon: s }))
    : fallback.map(v => ({ kind: 'yt' as const, video: v }));

  const [idx, setIdx]       = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIdx((i + items.length) % items.length), [items.length]);
  const prev = useCallback(() => goTo(idx - 1), [idx, goTo]);
  const next = useCallback(() => goTo(idx + 1), [idx, goTo]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % items.length), 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, items.length, idx]);

  const cur      = items[idx];
  const href     = cur.kind === 'db' ? `/${cur.sermon.slug}` : `https://www.youtube.com/watch?v=${cur.video.id}`;
  const external = cur.kind === 'yt';

  return (
    <>
      <style>{`
        @keyframes hero-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .hero-progress { animation: hero-progress 7s linear forwards; }
      `}</style>

      <section
        className="relative overflow-hidden bg-[#0A0C10]"
        style={{ height: 'min(85vh, 720px)', minHeight: '480px' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background slides — all preloaded, cross-fade */}
        {items.map((it, i) => {
          const t = it.kind === 'db' ? getThumb(it.sermon) : ytThumb(it.video.id);
          return (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 10 : 0 }}
            >
              <img
                src={t}
                alt=""
                className="w-full h-full object-cover object-center"
                onLoad={() => setLoaded(l => ({ ...l, [i]: true }))}
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
              />
              {/* Netflix-style gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-[#0A0C10]/40" />
            </div>
          );
        })}

        {/* Text overlay — bottom left */}
        <div className="absolute bottom-10 left-6 md:left-12 max-w-lg" style={{ zIndex: 20 }}>
          {cur.kind === 'db' && (
            <>
              {cur.sermon.series && (
                <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest mb-2" style={H}>
                  {cur.sermon.series.title}
                </p>
              )}
              <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-2 drop-shadow-lg" style={H}>
                {cur.sermon.title}
              </h2>
              <p className="text-white/70 text-sm mb-1">{cur.sermon.preacher}</p>
              {cur.sermon.description && (
                <p className="text-white/55 text-sm leading-relaxed mb-4 line-clamp-2 hidden md:block">
                  {cur.sermon.description.replace(/[#*_`]/g, '').substring(0, 160)}
                </p>
              )}
            </>
          )}
          {cur.kind === 'yt' && (
            <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-4 drop-shadow-lg" style={H}>
              {cur.video.title}
            </h2>
          )}
          {external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all hover:bg-white/90 shadow-xl"
              style={H}
            >
              <Play className="w-4 h-4 fill-black" /> Watch Now
            </a>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-2 bg-white text-black font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all hover:bg-white/90 shadow-xl"
              style={H}
            >
              <Play className="w-4 h-4 fill-black" /> Watch Now
            </Link>
          )}
        </div>

        {/* Prev / Next arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
              style={{ zIndex: 30 }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
              style={{ zIndex: 30 }}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Slide indicator dots */}
        {items.length > 1 && (
          <div
            className="absolute bottom-6 right-6 md:right-12 flex gap-1.5"
            style={{ zIndex: 30 }}
          >
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="h-[3px] rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? '28px' : '10px',
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        )}

        {/* Progress bar */}
        {!paused && items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10" style={{ zIndex: 30 }}>
            <div
              key={`prog-${idx}`}
              className="h-full bg-[#BF0A30] origin-left hero-progress"
            />
          </div>
        )}
      </section>
    </>
  );
}

/* ─── Netflix-style thumbnail card ──────────────────────────────── */
function VideoCard({ thumb, title, sub, href, external }: {
  thumb: string; title: string; sub: string; href: string; external?: boolean;
}) {
  const inner = (
    <div className="group flex-shrink-0 w-[200px] sm:w-[240px] text-left">
      <div className="relative aspect-video rounded-xl overflow-hidden group-hover:scale-[1.03] transition-transform duration-300">
        <img
          src={thumb}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-11 h-11 rounded-full bg-[#BF0A30]/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
        {inner}
      </a>
    );
  }
  return <Link href={href} className="flex-shrink-0">{inner}</Link>;
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
  const series = sermon.series as { title: string; slug: string } | null;
  const summary = sermon.description;
  return (
    <Link href={`/${sermon.slug}`} className="group flex-shrink-0 w-[180px] sm:w-[220px]">
      <div className="relative aspect-video rounded-xl overflow-hidden group-hover:scale-[1.04] transition-transform duration-300">
        <img src={thumb} alt={sermon.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        {series && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#BF0A30] text-white text-[9px] font-black uppercase tracking-wider rounded-full">
            {series.title}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-11 h-11 rounded-full bg-[#BF0A30]/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-2.5 px-0.5">
        <p className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#BF0A30] transition-colors" style={H}>{sermon.title}</p>
        <p className="text-white/50 text-xs mt-0.5">{sermon.preacher}</p>
        {summary && (
          <p className="text-white/35 text-[11px] mt-1 line-clamp-2 leading-relaxed">{summary.replace(/[#*_`]/g, '').substring(0, 120)}</p>
        )}
      </div>
    </Link>
  );
}

interface SermonsPageProps {
  sermons:        Sermon[];
  featuredSermon: Sermon | null;
  seriesList:     { id: string; title: string; slug: string }[];
  preachers:      string[];
}

export default function SermonsPage({ sermons, featuredSermon, seriesList, preachers }: SermonsPageProps) {
  const [search,   setSearch]   = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredDb = search
    ? sermons.filter((s) => {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.preacher.toLowerCase().includes(q);
      })
    : [];

  // Group sermons by series
  const bySeries = seriesList.map(sr => ({
    series: sr,
    sermons: sermons.filter(s => (s.series as any)?.id === sr.id || s.series_id === sr.id),
  })).filter(g => g.sermons.length > 0);

  const [filterPreacher, setFilterPreacher] = useState<string>('all');

  // Group by category and preacher
  const categorySermons = sermons.filter(s => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (filterPreacher !== 'all' && s.preacher !== filterPreacher) return false;
    return true;
  });

  return (
    <Layout title="Sermons — Ruach Tabernacle" description="Watch powerful messages from Ruach Tabernacle. Kingdom-focused sermons that will transform your life.">
      <div className="min-h-screen bg-[#0A0C10] pt-16 sm:pt-24">

        {/* ══════════════════════════════════════════════
            NETFLIX HERO SLIDER
        ══════════════════════════════════════════════ */}
        <HeroSlider sermons={sermons} fallback={FEATURED_VIDEOS} />

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
            CATEGORY FILTERS + ROWS
        ══════════════════════════════════════════════ */}
        {!search && (
          <div className="pt-8 pb-16">

            {/* Category filter chips */}
            {sermons.length > 0 && (
              <div className="flex gap-2 overflow-x-auto px-6 md:px-12 pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
                <button onClick={() => setActiveCategory('all')}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeCategory === 'all' ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.10]'
                  }`} style={H}>
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                      activeCategory === cat ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.10]'
                    }`} style={H}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {preachers.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-6 md:px-12 pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
                <button onClick={() => setFilterPreacher('all')}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                    filterPreacher === 'all' ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.10]'
                  }`} style={H}>
                  All Preachers
                </button>
                {preachers.map(p => (
                  <button key={p} onClick={() => setFilterPreacher(p)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                      filterPreacher === p ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.10]'
                    }`} style={H}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Dynamic rows: sermons from DB */}
            {sermons.length > 0 && activeCategory === 'all' ? (
              <>
                {/* Recent row */}
                <SermonRow title="Recent Messages">
                  {sermons.slice(0, 12).map(s => <DbSermonCard key={s.id} sermon={s} />)}
                </SermonRow>

                {/* Rows per series */}
                {bySeries.map(({ series: sr, sermons: sg }) => (
                  <SermonRow key={sr.id} title={sr.title}>
                    {sg.map(s => <DbSermonCard key={s.id} sermon={s} />)}
                  </SermonRow>
                ))}
              </>
            ) : sermons.length > 0 && activeCategory !== 'all' ? (
              <SermonRow title={`${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Messages`}>
                {categorySermons.map(s => <DbSermonCard key={s.id} sermon={s} />)}
              </SermonRow>
            ) : (
              /* Fallback: hardcoded rows when DB is empty */
              <>
                <SermonRow title="Featured Messages">
                  {FEATURED_VIDEOS.map(v => (
                    <VideoCard
                      key={v.id}
                      thumb={ytThumb(v.id)}
                      title={v.title}
                      sub={v.preacher}
                      href={`https://www.youtube.com/watch?v=${v.id}`}
                      external
                    />
                  ))}
                </SermonRow>
                <SermonRow title="More from Ruach">
                  {[...FEATURED_VIDEOS].reverse().map(v => (
                    <VideoCard
                      key={`more-${v.id}`}
                      thumb={ytThumb(v.id)}
                      title={v.title}
                      sub={v.preacher}
                      href={`https://www.youtube.com/watch?v=${v.id}`}
                      external
                    />
                  ))}
                </SermonRow>
              </>
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
    const [{ data: sermons }, { data: featured }, { data: seriesList }] = await Promise.all([
      supabase.from('sermons').select('*, series(id, title, slug)').order('service_date', { ascending: false }).limit(60),
      (supabase as any).from('sermons').select('*, series(id, title, slug)').eq('is_featured', true).limit(1).maybeSingle(),
      supabase.from('series').select('id, title, slug').order('title'),
    ]);
    const uniquePreachers = [...new Set((sermons ?? []).map((s: any) => s.preacher).filter(Boolean))] as string[];
    return {
      props: {
        sermons:        sermons ?? [],
        featuredSermon: featured ?? null,
        seriesList:     seriesList ?? [],
        preachers:      uniquePreachers.sort(),
      },
    };
  } catch {
    return { props: { sermons: [], featuredSermon: null, seriesList: [], preachers: [] } };
  }
};
