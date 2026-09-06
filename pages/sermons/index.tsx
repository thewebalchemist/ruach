import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Search, X, ChevronLeft, ChevronRight, Calendar, User, Layers } from 'lucide-react';
import { GetServerSideProps } from 'next';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';
import type { Sermon } from '@/types';
import ThemeHero from '@/components/streaming/ThemeHero';

// Series + preacher filtering only — no categories

// Font test: Archivo — accent voice is a lighter weight, no italics
const H = { fontFamily: 'Archivo, sans-serif', fontWeight: 800 } as const;
const serif = { fontFamily: 'Archivo, sans-serif', fontWeight: 600 } as const;

const FEATURED_VIDEOS = [
  { id: 'nznXwkJlJ44', title: 'Greater Glory', preacher: 'Ruach Tabernacle' },
  { id: 'j02RsIkJj9s', title: 'Raising Kingdom Champions', preacher: 'Ruach Tabernacle' },
  { id: '-h0OTNmAjZI', title: 'Faith That Moves Mountains', preacher: 'Ruach Tabernacle' },
  { id: 'g780BzATRpc', title: 'Walking in Purpose', preacher: 'Ruach Tabernacle' },
  { id: 'aa3HrKJLf9o', title: 'The Power of the Holy Spirit', preacher: 'Ruach Tabernacle' },
  { id: 'BRMy37ZHzX0', title: 'Kingdom Business', preacher: 'Ruach Tabernacle' },
];

function ytThumb(id: string) { return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }

function getYouTubeId(url: string) { return url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? ''; }

function getThumb(s: Sermon) {
  if (s.thumbnail_url) return s.thumbnail_url;
  const id = getYouTubeId(s.youtube_url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '/church-photos/IMG_1716.jpg';
}

/* ─── Netflix Hero Slider ────────────────────────────────────────── */
type SlideItem = { kind: 'db'; sermon: Sermon } | { kind: 'yt'; video: typeof FEATURED_VIDEOS[0] };

function HeroSlider({ sermons, fallback }: { sermons: Sermon[]; fallback: typeof FEATURED_VIDEOS }) {
  const items: SlideItem[] = sermons.length > 0
    ? sermons.slice(0, 6).map(s => ({ kind: 'db' as const, sermon: s }))
    : fallback.map(v => ({ kind: 'yt' as const, video: v }));

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIdx((i + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % items.length), 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, items.length, idx]);

  const cur = items[idx];
  const href = cur.kind === 'db' ? `/${cur.sermon.slug}` : `https://www.youtube.com/watch?v=${cur.video.id}`;
  const external = cur.kind === 'yt';

  return (
    <>
      <style>{`@keyframes hero-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}.hero-progress{animation:hero-progress 7s linear forwards}`}</style>
      {/* ── MOBILE hero: card + text (visible thumbnail) ──────── */}
      <section className="sm:hidden bg-[#0A0C10] px-4 pt-2 pb-6">
        {/* Thumbnail card */}
        <div className="relative rounded-2xl overflow-hidden aspect-video mb-4">
          {items.map((it, i) => {
            const t = it.kind === 'db' ? getThumb(it.sermon) : ytThumb(it.video.id);
            return (
              <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === idx ? 1 : 0 }}>
                <img src={t} alt="" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            );
          })}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Play className="w-7 h-7 text-white fill-white ml-0.5" />
            </div>
          </div>
          {/* Dots */}
          {items.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" style={{ zIndex: 10 }}>
              {items.map((_, i) => <button key={i} onClick={() => goTo(i)} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', transform: i === idx ? 'scale(1.3)' : 'scale(1)' }} />)}
            </div>
          )}
        </div>
        {/* Text info */}
        <div>
          {cur.kind === 'db' && cur.sermon.series && (
            <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest mb-1.5" style={H}>{cur.sermon.series.title}</p>
          )}
          <h2 className="text-white text-xl font-black leading-tight mb-1.5" style={H}>
            {cur.kind === 'db' ? cur.sermon.title : cur.video.title}
          </h2>
          {cur.kind === 'db' && <p className="text-white/60 text-xs mb-3">{cur.sermon.preacher}</p>}
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg" style={H}>
              <Play className="w-4 h-4 fill-black" /> Watch Now
            </a>
          ) : (
            <Link href={href} className="inline-flex items-center gap-2 bg-white text-black font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg" style={H}>
              <Play className="w-4 h-4 fill-black" /> Watch Now
            </Link>
          )}
        </div>
      </section>

      {/* ── DESKTOP hero: cinematic full-bleed backdrop ────────── */}
      <section
        className="relative overflow-hidden bg-[#0A0C10] hidden sm:block"
        style={{ height: 'min(80vh, 720px)', minHeight: '420px' }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      >
        {items.map((it, i) => {
          const t = it.kind === 'db' ? getThumb(it.sermon) : ytThumb(it.video.id);
          return (
            <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 10 : 0 }}>
              <img src={t} alt="" className="w-full h-full object-cover object-center"
                onError={e => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-[#0A0C10]/40" />
            </div>
          );
        })}

        <div className="absolute bottom-12 left-6 md:left-12 max-w-lg" style={{ zIndex: 20 }}>
          {cur.kind === 'db' && (
            <>
              {cur.sermon.series && (
                <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest mb-2" style={H}>{cur.sermon.series.title}</p>
              )}
              <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-2 drop-shadow-lg" style={H}>{cur.sermon.title}</h2>
              <p className="text-white/70 text-sm mb-1">{cur.sermon.preacher}</p>
              {cur.sermon.description && (
                <p className="text-white/55 text-sm leading-relaxed mb-4 line-clamp-2 hidden md:block">{cur.sermon.description.replace(/[#*_`]/g, '').substring(0, 160)}</p>
              )}
            </>
          )}
          {cur.kind === 'yt' && <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-4 drop-shadow-lg" style={H}>{cur.video.title}</h2>}
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all hover:bg-white/90 shadow-xl" style={H}>
              <Play className="w-4 h-4 fill-black" /> Watch Now
            </a>
          ) : (
            <Link href={href} className="inline-flex items-center gap-2 bg-white text-black font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all hover:bg-white/90 shadow-xl" style={H}>
              <Play className="w-4 h-4 fill-black" /> Watch Now
            </Link>
          )}
        </div>

        {items.length > 1 && (
          <>
            <button onClick={() => goTo(idx - 1)} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm" style={{ zIndex: 30 }}><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => goTo(idx + 1)} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm" style={{ zIndex: 30 }}><ChevronRight className="w-5 h-5" /></button>
          </>
        )}

        {items.length > 1 && (
          <div className="absolute bottom-6 right-6 md:right-12 flex gap-1.5" style={{ zIndex: 30 }}>
            {items.map((_, i) => <button key={i} onClick={() => goTo(i)} className="h-[3px] rounded-full transition-all duration-300" style={{ width: i === idx ? '28px' : '10px', background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)' }} />)}
          </div>
        )}
        {!paused && items.length > 1 && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10" style={{ zIndex: 30 }}><div key={`prog-${idx}`} className="h-full bg-[#BF0A30] origin-left hero-progress" /></div>}
      </section>
    </>
  );
}

/* ─── Sermon card (small) ──────────────────────────────────────── */
function DbSermonCard({ sermon }: { sermon: Sermon }) {
  const thumb = getThumb(sermon);
  const series = sermon.series as { title: string; slug: string } | null;
  return (
    <Link href={`/${sermon.slug}`} className="group flex-shrink-0 w-[160px] sm:w-[200px]">
      <div className="relative aspect-video rounded-xl overflow-hidden group-hover:scale-[1.04] transition-transform duration-300">
        <img src={thumb} alt={sermon.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        {series && <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#BF0A30] text-white text-[9px] font-black uppercase tracking-wider rounded-full">{series.title}</span>}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-[#BF0A30]/90 flex items-center justify-center shadow-xl"><Play className="w-5 h-5 text-white fill-white ml-0.5" /></div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#BF0A30] transition-colors" style={H}>{sermon.title}</p>
        <p className="text-white/50 text-[11px] mt-0.5">{sermon.preacher}</p>
      </div>
    </Link>
  );
}

/* ─── Series card (glassmorphic) ───────────────────────────────── */
function SeriesCard({ title, sermons, onOpen }: { title: string; sermons: Sermon[]; onOpen: () => void }) {
  const thumb = sermons[0] ? getThumb(sermons[0]) : '/church-photos/IMG_1716.jpg';
  return (
    <button onClick={onOpen} className="group flex-shrink-0 w-[280px] sm:w-[340px] text-left">
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
        <img src={thumb} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        {/* Glassmorphic title bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5"
          style={{ background: 'rgba(10,12,16,0.55)', backdropFilter: 'blur(16px) saturate(150%)', WebkitBackdropFilter: 'blur(16px) saturate(150%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-black text-base sm:text-lg leading-tight" style={H}>{title}</p>
              <p className="text-white/50 text-xs mt-0.5">{sermons.length} episode{sermons.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#BF0A30]/80 transition-colors">
              <Layers className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Series modal (Netflix-style) ─────────────────────────────── */
function SeriesModal({ title, sermons, onClose }: { title: string; sermons: Sermon[]; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const heroSermon = sermons[0];
  const heroThumb = heroSermon ? getThumb(heroSermon) : '/church-photos/IMG_1716.jpg';

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-3xl mx-4 my-8 sm:my-16 rounded-2xl overflow-hidden bg-[#111316] shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Hero banner */}
        <div className="relative aspect-video sm:aspect-[2.2/1]">
          <img src={heroThumb} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111316] via-[#111316]/40 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4">
            <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest mb-1" style={H}>Series</p>
            <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-black leading-tight" style={H}>{title}</h2>
            <p className="text-white/60 text-xs mt-1">{sermons.length} episode{sermons.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Episodes list */}
        <div className="p-4 sm:p-6 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-[#8B95A8] mb-2" style={H}>Episodes</p>
          {sermons.map((s, i) => {
            const thumb = getThumb(s);
            return (
              <Link key={s.id} href={`/${s.slug}`} onClick={onClose}
                className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <span className="text-white/25 text-sm font-black w-6 text-center flex-shrink-0" style={H}>{i + 1}</span>
                <div className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1e28]">
                  <img src={thumb} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-[#BF0A30]/90 flex items-center justify-center"><Play className="w-4 h-4 text-white fill-white ml-0.5" /></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#BF0A30] transition-colors" style={H}>{s.title}</p>
                  <p className="text-[11px] text-[#8B95A8] mt-1">{s.preacher}</p>
                  {s.description && <p className="text-white/30 text-[11px] mt-1 line-clamp-1 hidden sm:block">{s.description.replace(/[#*_`]/g, '').substring(0, 100)}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Horizontal scroll row ────────────────────────────────────── */
function SermonRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-white text-lg font-black mb-4 px-4 sm:px-6 md:px-12" style={H}>{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 px-4 sm:px-6 md:px-12" style={{ scrollbarWidth: 'none' }}>{children}</div>
    </div>
  );
}

/* ─── Fallback video card ──────────────────────────────────────── */
function VideoCard({ thumb, title, href, external }: { thumb: string; title: string; sub: string; href: string; external?: boolean }) {
  const inner = (
    <div className="group flex-shrink-0 w-[160px] sm:w-[200px] text-left">
      <div className="relative aspect-video rounded-xl overflow-hidden group-hover:scale-[1.03] transition-transform duration-300">
        <img src={thumb} alt={title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-[#BF0A30]/90 flex items-center justify-center shadow-xl"><Play className="w-5 h-5 text-white fill-white ml-0.5" /></div>
        </div>
      </div>
    </div>
  );
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">{inner}</a>;
  return <Link href={href} className="flex-shrink-0">{inner}</Link>;
}

/* ─── Page ─────────────────────────────────────────────────────── */
interface SermonsPageProps {
  sermons: Sermon[];
  featuredSermon: Sermon | null;
  seriesList: { id: string; title: string; slug: string }[];
  preachers: string[];
}

export default function SermonsPage({ sermons, featuredSermon, seriesList, preachers }: SermonsPageProps) {
  const [search, setSearch] = useState('');
  const [filterPreacher, setFilterPreacher] = useState('all');
  const [openSeries, setOpenSeries] = useState<{ title: string; sermons: Sermon[] } | null>(null);

  const filteredDb = search
    ? sermons.filter(s => { const q = search.toLowerCase(); return s.title.toLowerCase().includes(q) || s.preacher.toLowerCase().includes(q); })
    : [];

  const bySeries = seriesList.map(sr => ({
    series: sr,
    sermons: sermons.filter(s => (s.series as any)?.id === sr.id || s.series_id === sr.id),
  })).filter(g => g.sermons.length > 0);

  const displaySermons = filterPreacher !== 'all'
    ? sermons.filter(s => s.preacher === filterPreacher)
    : sermons;

  return (
    <Layout title="Sermons — Ruach Tabernacle" description="Watch powerful messages from Ruach Tabernacle. Kingdom-focused sermons that will transform your life.">
      <div className="min-h-screen bg-[#0A0C10] pt-16 sm:pt-24">

        <ThemeHero sermons={sermons} fallback={FEATURED_VIDEOS} />

        {/* Search */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 pt-8 pb-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B95A8]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sermons…"
              className="w-full bg-[#12151C] border border-white/10 text-white placeholder-[#8B95A8] rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-[#BF0A30] transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B95A8] hover:text-white"><X className="w-4 h-4" /></button>}
          </div>
        </div>

        {/* Search results */}
        {search && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-6">
            {filteredDb.length === 0 ? (
              <p className="text-[#8B95A8] text-sm">No sermons match &ldquo;{search}&rdquo;.</p>
            ) : (
              <>
                <p className="text-[#8B95A8] text-xs font-bold uppercase tracking-widest mb-5" style={H}>Search Results</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {filteredDb.map(s => <DbSermonCard key={s.id} sermon={s} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* Main content */}
        {!search && (
          <div className="pt-8 pb-16">

            {/* Preacher filter — glassmorphic pills */}
            {preachers.length > 1 && (
              <div className="px-4 sm:px-6 md:px-12 mb-8">
                <p className="text-[#8B95A8] text-[10px] font-black uppercase tracking-widest mb-3" style={H}>Filter by Preacher</p>
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  <button onClick={() => setFilterPreacher('all')}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      filterPreacher === 'all'
                        ? 'bg-[#BF0A30] text-white shadow-lg shadow-[#BF0A30]/30'
                        : 'text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                    }`}
                    style={{ ...H, ...(filterPreacher !== 'all' ? { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } : {}) }}>
                    All
                  </button>
                  {preachers.map(p => (
                    <button key={p} onClick={() => setFilterPreacher(p)}
                      className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        filterPreacher === p
                          ? 'bg-[#BF0A30] text-white shadow-lg shadow-[#BF0A30]/30'
                          : 'text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                      }`}
                      style={{ ...H, ...(filterPreacher !== p ? { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } : {}) }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {displaySermons.length > 0 && filterPreacher === 'all' ? (
              <>
                {/* Series row — glassmorphic landscape cards */}
                {bySeries.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-white text-lg font-black mb-4 px-4 sm:px-6 md:px-12" style={H}>Sermon Series</h2>
                    <div className="flex gap-4 overflow-x-auto pb-3 px-4 sm:px-6 md:px-12" style={{ scrollbarWidth: 'none' }}>
                      {bySeries.map(({ series: sr, sermons: sg }) => (
                        <SeriesCard key={sr.id} title={sr.title} sermons={sg} onOpen={() => setOpenSeries({ title: sr.title, sermons: sg })} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent row */}
                <SermonRow title="Recent Messages">
                  {sermons.slice(0, 12).map(s => <DbSermonCard key={s.id} sermon={s} />)}
                </SermonRow>

                {/* Series episode rows */}
                {bySeries.map(({ series: sr, sermons: sg }) => (
                  <SermonRow key={sr.id} title={sr.title}>
                    {sg.map(s => <DbSermonCard key={s.id} sermon={s} />)}
                  </SermonRow>
                ))}
              </>
            ) : displaySermons.length > 0 ? (
              <SermonRow title={`${filterPreacher}`}>
                {displaySermons.map(s => <DbSermonCard key={s.id} sermon={s} />)}
              </SermonRow>
            ) : sermons.length === 0 ? (
              <>
                <SermonRow title="Featured Messages">
                  {FEATURED_VIDEOS.map(v => <VideoCard key={v.id} thumb={ytThumb(v.id)} title={v.title} sub={v.preacher} href={`https://www.youtube.com/watch?v=${v.id}`} external />)}
                </SermonRow>
                <SermonRow title="More from Ruach">
                  {[...FEATURED_VIDEOS].reverse().map(v => <VideoCard key={`more-${v.id}`} thumb={ytThumb(v.id)} title={v.title} sub={v.preacher} href={`https://www.youtube.com/watch?v=${v.id}`} external />)}
                </SermonRow>
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <p className="text-[#8B95A8] text-sm">No sermons found for this preacher.</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        {!search && (
          <div className="border-t border-white/5 bg-[#0A0C10] py-14 text-center">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Every Sunday · 3 Services</p>
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-black mb-4" style={H}>
              Experience it<br /><span style={serif}>in person.</span>
            </h2>
            <p className="text-[#8B95A8] text-sm mb-8 max-w-xs mx-auto">Watching online is great — but there&apos;s something special about being in the room.</p>
            <div className="flex flex-wrap gap-3 justify-center px-4">
              <Link href="/new-here" className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all shadow-xl shadow-[rgba(191,10,48,0.35)]" style={H}>
                Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/live" className="flex items-center gap-2 border border-white/20 text-white hover:border-white/40 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all" style={H}>Watch Live</Link>
            </div>
          </div>
        )}
      </div>

      {/* Series modal */}
      {openSeries && <SeriesModal title={openSeries.title} sermons={openSeries.sermons} onClose={() => setOpenSeries(null)} />}
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
    return { props: { sermons: sermons ?? [], featuredSermon: featured ?? null, seriesList: seriesList ?? [], preachers: uniquePreachers.sort() } };
  } catch {
    return { props: { sermons: [], featuredSermon: null, seriesList: [], preachers: [] } };
  }
};
