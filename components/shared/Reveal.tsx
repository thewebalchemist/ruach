import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   SCROLL ANIMATION PRIMITIVES
   A tiny, dependency-free system built on one shared IntersectionObserver.

   <Reveal>        — fades/slides an element in the first time it scrolls into view
   .rise-mask/.rise — line-rise text inside a <Reveal> (styles in globals.css)
   <CountUp>       — animates "100,000+"-style stats when they enter the view
   <Parallax>      — gentle scroll-linked drift for images / decorative layers
   <ScrollProgress>— brand-red hairline at the very top of the page

   All hidden states are gated on `html.reveal-ready` (set below on mount),
   so content stays fully visible if JavaScript never runs, and
   prefers-reduced-motion users get static content.
═══════════════════════════════════════════════════════════════════ */

type RevealVariant = 'up' | 'fade' | 'left' | 'right' | 'scale' | 'blur' | 'none';

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function observe(el: Element, cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  if (!('IntersectionObserver' in window)) { cb(); return () => {}; }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            callbacks.get(entry.target)?.();
            callbacks.delete(entry.target);
            sharedObserver?.unobserve(entry.target);
          }
        }
      },
      // Trigger slightly before the element fully enters, so the motion
      // is already underway as the user reaches it.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
  }
  callbacks.set(el, cb);
  sharedObserver.observe(el);
  return () => { callbacks.delete(el); sharedObserver?.unobserve(el); };
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Marks the document as animation-capable — hidden pre-reveal states only
    apply under `html.reveal-ready`, keeping content visible without JS. */
function useRevealReady() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    document.documentElement.classList.add('reveal-ready');
  }, []);
}

interface RevealProps {
  children: ReactNode;
  /** Motion style. `none` still toggles `.is-revealed` so nested `.rise` text can animate. */
  variant?: RevealVariant;
  /** Extra delay in ms — use for staggering grids: delay={i * 90} */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'figure' | 'header';
}

export function Reveal({ children, variant = 'up', delay = 0, className = '', style, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useRevealReady();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) { setShown(true); return; }
    return observe(el, () => setShown(true));
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-reveal={variant}
      className={`${className} ${shown ? 'is-revealed' : ''}`.trim()}
      style={{ ...style, ...(delay ? { ['--reveal-delay' as string]: `${delay}ms` } : {}) }}
    >
      {children}
    </Tag>
  );
}

/* ─── Line-rise text ─────────────────────────────────────────────
   Wraps one heading line in an overflow mask; the inner span slides
   up out of the mask when the nearest <Reveal> ancestor fires.
   Pass `index` to stagger successive lines.                      */
export function RiseLine({ children, index = 0, className = '', style }: {
  children: ReactNode; index?: number; className?: string; style?: CSSProperties;
}) {
  return (
    <span className={`rise-mask ${className}`.trim()}>
      <span className="rise" style={{ ...style, ['--i' as string]: index }}>{children}</span>
    </span>
  );
}

/* ─── CountUp ────────────────────────────────────────────────────
   Animates stats like "100,000+" or "18+" from 0 when scrolled into
   view. Non-numeric prefix/suffix are preserved verbatim.         */
export function CountUp({ value, duration = 1600, className = '', style }: {
  value: string; duration?: number; className?: string; style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^([^0-9]*)([\d,]+)(.*)$/);
    if (!el || !match || prefersReducedMotion()) return;
    const [, prefix, num, suffix] = match;
    const target = parseInt(num.replace(/,/g, ''), 10);
    if (!Number.isFinite(target)) return;

    setDisplay(`${prefix}0${suffix}`);
    return observe(el, () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        // ease-out-expo — races up, lands softly
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setDisplay(`${prefix}${Math.round(target * eased).toLocaleString('en-US')}${suffix}`);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, [value, duration]);

  return <span ref={ref} className={className} style={style}>{display}</span>;
}

/* ─── Parallax ───────────────────────────────────────────────────
   Gentle scroll-linked drift. `speed` is the fraction of scroll
   distance applied as translateY (positive drifts slower than the
   page, feeling "deeper"). Keep it subtle: 0.06–0.15.             */
export function Parallax({ children, speed = 0.1, className = '', style }: {
  children: ReactNode; speed?: number; className?: string; style?: CSSProperties;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || prefersReducedMotion()) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = outer.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return; // off-screen
      // Distance of the element's centre from the viewport centre
      const offset = rect.top + rect.height / 2 - vh / 2;
      inner.style.transform = `translate3d(0, ${(offset * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={outerRef} className={className} style={style}>
      <div ref={innerRef} style={{ willChange: 'transform', height: '100%' }}>{children}</div>
    </div>
  );
}

/* ─── ScrollProgress ─────────────────────────────────────────────
   Brand-red hairline across the very top that fills as you read.  */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden />;
}
