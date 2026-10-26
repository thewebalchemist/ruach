import { useEffect, useRef } from 'react';

/** Writes --p (0 → 1) on the element as it travels up through the
    viewport: 0 when its top meets the bottom edge, 1 when its bottom
    leaves the top. `gain` speeds it up (2 = done by halfway).
    Reduced motion: --p stays at 1 (final state). */
export function useScrollVar<T extends HTMLElement>(gain = 1) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1');
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = Math.min(1, Math.max(0, ((vh - r.top) / (vh + r.height)) * gain));
      el.style.setProperty('--p', p.toFixed(3));
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
  }, [gain]);
  return ref;
}
