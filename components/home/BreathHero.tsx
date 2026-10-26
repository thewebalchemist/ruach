import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX } from 'lucide-react';
import s from './home.module.css';

/* ─── The breath ─────────────────────────────────────────────────
   1. The room is dim (the photo is already painted: fast LCP).
   2. A crimson gust comes in from the left and draws a circle.
   3. The photo lights up inside the circle, then the circle opens
      to fill the hero and the headline rises.
   4. Thin wind streams keep moving; on larger screens the welcome
      video fades in behind once the intro has finished.
   Reduced motion or no JS: step 4's resting state, no video autoplay.
   A second visit in the same session plays a shortened version.     */

const HERO_IMG = '/rhema-feast/rhema-feast1.jpg';
const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };

type Phase = 'idle' | 'draw' | 'lit' | 'open' | 'done';

interface Geo { w: number; h: number; cx: number; cy: number; r: number }

function geometry(w: number, h: number): Geo {
  const phone = w < 768;
  const cx = phone ? w * 0.62 : w * 0.7;
  const cy = phone ? h * 0.27 : h * 0.46;
  const r = phone ? Math.min(w * 0.3, 120) : Math.min(h * 0.27, w * 0.17, 240);
  return { w, h, cx, cy, r };
}

/** One continuous path: the gust sweeps in, meets the bottom of the
    circle travelling right, and goes once round (counter-clockwise). */
function gustPath({ w, h, cx, cy, r }: Geo) {
  const y0 = Math.min(h * 0.92, cy + r + h * 0.22);
  return [
    `M ${-40} ${y0}`,
    `C ${w * 0.22} ${y0 - h * 0.02}, ${cx - r * 1.9} ${cy + r}, ${cx} ${cy + r}`,
    `A ${r} ${r} 0 1 0 ${cx} ${cy - r}`,
    `A ${r} ${r} 0 1 0 ${cx} ${cy + r}`,
  ].join(' ');
}

/** Wind streams: long, shallow S-curves across the full width. */
function streams({ w, h }: Geo) {
  const rows = [0.18, 0.34, 0.52, 0.66, 0.8];
  return rows.map((t, i) => {
    const y = h * t;
    const a = h * (0.05 + (i % 3) * 0.025);
    return `M ${-60} ${y} C ${w * 0.3} ${y - a}, ${w * 0.55} ${y + a}, ${w + 60} ${y - a * 0.4}`;
  });
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function BreathHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const gustRef = useRef<SVGPathElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [videoOn, setVideoOn] = useState(false);
  const [muted, setMuted] = useState(true);

  // Measure, and keep the circle centred on resize.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setGeo(geometry(el.clientWidth, el.clientHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Run the intro once, as soon as we know the geometry. Timers live in a
  // ref so phase changes and resizes don't cancel the sequence.
  const started = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!geo || started.current) return;
    started.current = true;
    if (reducedMotion()) { setPhase('done'); return; }
    let quick = false;
    try { quick = sessionStorage.getItem('ruach-breath') === '1'; sessionStorage.setItem('ruach-breath', '1'); } catch { /* private mode */ }
    const k = quick ? 0.45 : 1;
    timers.current = [
      window.setTimeout(() => setPhase('draw'), 120 * k),
      window.setTimeout(() => setPhase('lit'), 1250 * k),
      window.setTimeout(() => setPhase('open'), 1650 * k),
      window.setTimeout(() => setPhase('done'), 2900 * k),
    ];
  }, [geo]);

  // Gust stroke draw: set the dash to the path's real length.
  useEffect(() => {
    const p = gustRef.current;
    if (!p || !geo) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    if (phase === 'idle') {
      p.style.transition = 'none';
      p.style.strokeDashoffset = `${len}`;
    } else if (phase === 'draw') {
      p.style.transition = 'stroke-dashoffset 1.25s cubic-bezier(.55,.06,.3,1)';
      p.style.strokeDashoffset = '0';
    } else {
      p.style.strokeDashoffset = '0';
    }
  }, [phase, geo]);

  // The circle: closed until lit, then opens past the corners.
  useEffect(() => {
    const el = ref.current;
    if (!el || !geo) return;
    const far = Math.hypot(Math.max(geo.cx, geo.w - geo.cx), Math.max(geo.cy, geo.h - geo.cy)) + 40;
    el.style.setProperty('--hero-cx', `${geo.cx}px`);
    el.style.setProperty('--hero-cy', `${geo.cy}px`);
    const lit = el.querySelector<HTMLElement>(`.${s.lit}`);
    if (!lit) return;
    if (phase === 'idle' || phase === 'draw') {
      lit.style.transition = 'none';
      el.style.setProperty('--hero-r', '0px');
    } else if (phase === 'lit') {
      lit.style.transition = 'clip-path .5s ease-out, -webkit-clip-path .5s ease-out';
      el.style.setProperty('--hero-r', `${geo.r - 2}px`);
    } else {
      lit.style.transition = 'clip-path 1.3s cubic-bezier(.7,0,.2,1), -webkit-clip-path 1.3s cubic-bezier(.7,0,.2,1)';
      el.style.setProperty('--hero-r', `${far}px`);
    }
  }, [phase, geo]);

  // Welcome video: larger screens only, not on data saver, after the intro.
  useEffect(() => {
    if (phase !== 'done') return;
    const v = videoRef.current;
    if (!v || reducedMotion() || window.innerWidth < 768) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    if (!v.src) {
      v.src = '/videos/welcome-to-ruach.mp4';
      v.load();
    }
    const onPlay = () => setVideoOn(true);
    v.addEventListener('playing', onPlay);
    v.play().catch(() => { /* autoplay blocked: stay on the photo */ });
    return () => v.removeEventListener('playing', onPlay);
  }, [phase]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const open = phase === 'open' || phase === 'done';
  const gustOpacity = phase === 'open' || phase === 'done' ? 0 : 1;

  return (
    <section
      ref={ref}
      className={`${s.hero} ${s.intro} ${open ? s.open : ''} ${phase === 'done' ? s.done : ''}`}
    >
      {/* Dim room */}
      <div className={s.media} aria-hidden>
        <div className={s.breathe}>
          <Image src={HERO_IMG} alt="" fill priority sizes="100vw" quality={70} style={{ objectFit: 'cover', objectPosition: '50% 35%' }} />
        </div>
      </div>

      {/* Lit through the circle */}
      <div className={s.lit} aria-hidden>
        <div className={s.breathe}>
          <Image src={HERO_IMG} alt="" fill sizes="100vw" quality={70} style={{ objectFit: 'cover', objectPosition: '50% 35%' }} />
        </div>
        <video
          ref={videoRef}
          className={`${s.video} ${videoOn ? s.videoOn : ''}`}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        />
      </div>

      <div className={s.scrim} />

      {/* Wind */}
      {geo && (
        <svg className={s.wind} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden>
          {streams(geo).map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1540}
              className={`${s.stream} ${i === 1 || i === 3 ? s.streamRed : ''} ${open ? s.streamOn : ''}`}
              style={{ ['--dur' as string]: `${8 + i * 1.7}s`, ['--delay' as string]: `${-i * 2.3}s` }}
            />
          ))}
          <path
            ref={gustRef}
            d={gustPath(geo)}
            className={s.gust}
            style={{ opacity: gustOpacity, transition: 'opacity .9s ease .2s' }}
          />
        </svg>
      )}

      {/* Mute / unmute appears only once the video is playing */}
      <button
        onClick={toggleMute}
        className={`absolute bottom-28 lg:bottom-8 right-4 sm:right-6 z-20 hidden md:flex items-center gap-2 rounded-full bg-black/60 border border-white/15 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors ${s.mute} ${videoOn ? s.muteOn : ''}`}
        style={H}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        tabIndex={videoOn ? 0 : -1}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        {muted ? 'Unmute' : 'Mute'}
      </button>

      <div className={s.heroContent}>{children}</div>
    </section>
  );
}

