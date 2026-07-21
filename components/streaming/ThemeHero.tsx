import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Play, ChevronDown, ArrowRight } from 'lucide-react';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;
const AUTO_MS = 7000;
const FALLBACK_IMG = '/church-photos/IMG_1716.jpg';

/**
 * Minimal shape the hero actually reads — so both the full `Sermon` (/sermons)
 * and the homepage's lighter sermon row can feed it without a cast.
 */
export type HeroSermon = {
  title: string;
  slug: string;
  preacher: string;
  description?: string | null;
  thumbnail_url?: string | null;
  youtube_url?: string | null;
  series?: { title?: string | null } | null;
};

function ytId(url?: string | null) {
  return url?.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)?.[1] ?? '';
}
function thumbOf(s: HeroSermon) {
  if (s.thumbnail_url) return s.thumbnail_url;
  const id = ytId(s.youtube_url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : FALLBACK_IMG;
}

interface HeroItem {
  title: string;
  eyebrow: string;
  preacher: string;
  description: string;
  image: string;
  href: string;
}

/**
 * The JK "moving themes" hero, in Ruach red/gold. Wheel-scroll or hovering a
 * rail card swaps the featured sermon; releases into normal scroll after the
 * last slide. Drop-in replacement for the old HeroSlider.
 */
export default function ThemeHero({
  sermons,
  fallback = [],
}: {
  sermons: HeroSermon[];
  fallback?: { id: string; title: string; preacher: string }[];
}) {
  const items: HeroItem[] = sermons.length
    ? sermons.slice(0, 6).map((s) => ({
        title: s.title,
        eyebrow: s.series?.title || 'Sermon',
        preacher: s.preacher,
        description: (s.description || '').replace(/[#*_`]/g, '').slice(0, 170),
        image: thumbOf(s),
        href: `/${s.slug}`,
      }))
    : fallback.map((v) => ({
        title: v.title,
        eyebrow: 'Featured',
        preacher: v.preacher,
        description: '',
        image: `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`,
        href: `https://www.youtube.com/watch?v=${v.id}`,
      }));

  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const lockRef = useRef(false);
  const count = items.length;
  const active = items[index] ?? items[0];

  useEffect(() => {
    if (count < 2 || hovering) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => clearInterval(t);
  }, [count, hovering]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || count < 2) return;
    const onWheel = (e: WheelEvent) => {
      if (window.scrollY > 12) return;
      const down = e.deltaY > 0;
      if (down && index >= count - 1) return;
      if (!down && index <= 0) return;
      e.preventDefault();
      if (lockRef.current) return;
      lockRef.current = true;
      setIndex((i) => Math.min(count - 1, Math.max(0, i + (down ? 1 : -1))));
      setTimeout(() => (lockRef.current = false), 650);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [index, count]);

  const goTo = useCallback((i: number) => setIndex(i), []);
  if (!active) return null;
  const isExternal = active.href.startsWith('http');

  const WatchBtn = () => {
    const cls =
      'inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-[#BF0A30]/25';
    return isExternal ? (
      <a href={active.href} target="_blank" rel="noopener noreferrer" className={cls} style={H}>
        <Play className="w-4 h-4 fill-white" /> Watch Now
      </a>
    ) : (
      <Link href={active.href} className={cls} style={H}>
        <Play className="w-4 h-4 fill-white" /> Watch Now
      </Link>
    );
  };

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="relative overflow-hidden bg-[#0A0C10]"
      style={{ height: 'min(88vh, 760px)', minHeight: '460px' }}
    >
      {/* Backgrounds */}
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-all duration-[900ms] ease-out"
          style={{ opacity: i === index ? 1 : 0, transform: i === index ? 'scale(1)' : 'scale(1.06)', zIndex: i === index ? 5 : 0 }}
        >
          <img
            src={it.image}
            alt=""
            className="w-full h-full object-cover object-center"
            onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_IMG)}
          />
        </div>
      ))}
      {/* Scrims */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/70 to-transparent" style={{ zIndex: 6 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-[#0A0C10]/40" style={{ zIndex: 6 }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center max-w-[1500px] mx-auto px-6 md:px-12 lg:px-16" style={{ zIndex: 10 }}>
        <div key={index} className="max-w-xl" style={{ animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] mb-3" style={H}>{active.eyebrow}</p>
          <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-black leading-[0.98] mb-3 drop-shadow-lg" style={H}>
            {active.title}
          </h2>
          <p className="text-white/70 text-sm mb-2">{active.preacher}</p>
          {active.description && (
            <p className="text-white/55 text-sm leading-relaxed mb-6 line-clamp-2 hidden md:block max-w-md">{active.description}</p>
          )}
          <div className="flex items-center gap-4">
            <WatchBtn />
            <Link href="/sermons" className="hidden sm:inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors" style={H}>
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom themes rail */}
      {count > 1 && (
        <div className="absolute bottom-6 right-4 md:right-8 hidden md:block max-w-[46vw]" style={{ zIndex: 20 }}>
          <div className="flex items-end gap-3">
            <span className="mb-2 mr-1 hidden lg:block text-white/90 text-lg font-black" style={H}>Themes</span>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {items.map((it, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => setIndex(i)}
                  className={`group relative h-24 w-40 shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 ${
                    i === index ? 'border-[#BF0A30] ring-2 ring-[#BF0A30]/40' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_IMG)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2 text-left">
                    <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] truncate">{it.eyebrow}</p>
                    <p className="truncate text-xs font-bold text-white">{it.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pager + scroll cue */}
      <div className="absolute inset-x-0 bottom-6 mx-auto flex max-w-[1500px] items-end justify-between px-6 md:px-12 lg:px-16" style={{ zIndex: 20 }}>
        <div className="flex items-center gap-2 text-lg" style={H}>
          {items.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="tabular-nums">
              <span className={i === index ? 'text-[#D4AF37]' : 'text-white/30'}>{String(i + 1).padStart(2, '0')}</span>
              {i < count - 1 && <span className="mx-1 text-white/20">/</span>}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex flex-col items-center gap-1 text-white/50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Keep Scrolling</span>
          <ChevronDown className="w-4 h-4 text-[#BF0A30] animate-bounce" />
        </div>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  );
}
