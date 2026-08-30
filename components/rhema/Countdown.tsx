import { useState, useEffect } from 'react';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;

function diff(target: number) {
  const d = Math.max(0, target - Date.now());
  return {
    days:    Math.floor(d / 86400000),
    hours:   Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
    done:    d === 0,
  };
}

/**
 * Live countdown to an event. Renders zeros on the server + first client paint
 * (so there's no hydration mismatch), then ticks every second once mounted.
 */
export default function Countdown({
  target,
  variant = 'full',
}: {
  target: string;
  variant?: 'full' | 'compact';
}) {
  const targetMs = new Date(target).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(targetMs));
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const units = [
    { n: t?.days ?? 0, l: 'Days' },
    { n: t?.hours ?? 0, l: 'Hrs' },
    { n: t?.minutes ?? 0, l: 'Min' },
    { n: t?.seconds ?? 0, l: 'Sec' },
  ];
  const pad = (n: number) => String(n).padStart(2, '0');

  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center gap-2 tabular-nums" style={H}>
        {units.map((u, i) => (
          <span key={u.l} className="flex items-baseline gap-1">
            <span className="text-white text-sm">{pad(u.n)}</span>
            <span className="text-white/45 text-[9px] uppercase tracking-wider">{u.l}</span>
            {i < 3 && <span className="text-[#D4AF37]/50">:</span>}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {units.map((u) => (
        <div key={u.l} className="flex flex-col items-center">
          <span className="text-3xl sm:text-5xl md:text-6xl text-white tabular-nums leading-none" style={H}>{pad(u.n)}</span>
          <span className="text-[#D4AF37] text-[10px] sm:text-xs uppercase tracking-[0.25em] mt-2" style={H}>{u.l}</span>
        </div>
      ))}
    </div>
  );
}
