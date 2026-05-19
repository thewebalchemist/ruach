const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

interface MarqueeProps {
  text?: string;
  speed?: number;
  reverse?: boolean;
  dark?: boolean;
  className?: string;
}

export default function Marquee({
  text = "You're Family.",
  speed = 28,
  reverse = false,
  dark = false,
  className = '',
}: MarqueeProps) {
  const bg = dark ? 'bg-[#0A0C10] border-white/5' : 'bg-[#F5F0E8] border-[#E8E0D0]';
  const textColor = dark ? 'text-white/10' : 'text-[#BF0A30]/15';
  const animation = `marquee${reverse ? '-reverse' : ''} ${speed}s linear infinite`;

  return (
    <section className={`py-5 overflow-hidden border-y ${bg} ${className}`}>
      <div className="flex">
        <div
          className={`flex-shrink-0 flex items-center gap-16 ${textColor}`}
          style={{ animation, fontStyle: 'italic', whiteSpace: 'nowrap' }}
          aria-hidden
        >
          {Array.from({ length: 7 }, (_, i) => (
            <span key={`a${i}`} className="text-5xl md:text-7xl tracking-tight flex-shrink-0" style={H}>
              {text}
            </span>
          ))}
        </div>
        <div
          className={`flex-shrink-0 flex items-center gap-16 ${textColor}`}
          style={{ animation, fontStyle: 'italic', whiteSpace: 'nowrap' }}
          aria-hidden
        >
          {Array.from({ length: 7 }, (_, i) => (
            <span key={`b${i}`} className="text-5xl md:text-7xl tracking-tight flex-shrink-0" style={H}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
