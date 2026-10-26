import s from './home.module.css';

/* A short gust: the hero's wind line, reused as a section motif.
   Draws itself when the nearest <Reveal> ancestor is revealed. */
export default function WindLine({
  color = '#BF0A30',
  faint = 'rgba(191,10,48,0.35)',
  className = '',
  width = 220,
}: { color?: string; faint?: string; className?: string; width?: number }) {
  return (
    <svg
      viewBox="0 0 220 28"
      width={width}
      className={`${s.windLine} ${className}`}
      style={{ maxWidth: '100%' }}
      aria-hidden
    >
      <path d="M2 20 C 50 4, 96 30, 150 14 S 206 6, 218 10" pathLength={1} stroke={color} strokeWidth={2.5} style={{ ['--k' as string]: 0 }} />
      <path d="M30 26 C 72 16, 118 28, 168 22" pathLength={1} stroke={faint} strokeWidth={1.5} style={{ ['--k' as string]: 1 }} />
    </svg>
  );
}

/* Wider wind streams for a coloured panel (the crimson card). */
export function WindField({ stroke = 'rgba(255,255,255,0.22)' }: { stroke?: string }) {
  const rows = [
    'M-10 40 C 90 10, 170 70, 260 36 S 400 10, 470 30',
    'M-10 90 C 110 64, 190 120, 300 84 S 420 60, 470 76',
    'M-10 140 C 80 120, 200 170, 290 136 S 410 118, 470 128',
  ];
  return (
    <svg viewBox="0 0 460 170" preserveAspectRatio="none" className={`${s.windLine} absolute inset-x-0 top-0 h-full w-full`} aria-hidden>
      {rows.map((d, i) => (
        <path key={i} d={d} pathLength={1} stroke={stroke} strokeWidth={1.5} style={{ ['--k' as string]: i }} />
      ))}
    </svg>
  );
}
