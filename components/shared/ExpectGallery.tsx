import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, RiseLine } from '@/components/shared/Reveal';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

const PHOTOS = [
  '/church-photos/worship1.jpg',
  '/church-photos/ruach1.jpg',
  '/church-photos/ruach2.jpg',
  '/church-photos/worship-ruach.jpg',
  '/church-photos/ruach3.jpg',
  '/church-photos/worship3.jpg',
  '/church-photos/media-ruach.jpg',
  '/church-photos/aug-2025-a.jpg',
  '/church-photos/advancing-kingdom.jpg',
];

export default function ExpectGallery() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#000]">
      {/* Spirit breath orb */}
      <div
        className="spirit-orb spirit-breathe absolute w-[600px] h-[600px] bg-[#BF0A30] pointer-events-none"
        style={{ top: '30%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(160px)', opacity: 0.08, ['--spirit-dur' as string]: '12s' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
        {/* Header */}
        <Reveal variant="none" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={H}>Life at Ruach —</p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              <RiseLine index={0}>Here&apos;s What</RiseLine>
              <RiseLine index={1} style={serif}>to Expect.</RiseLine>
            </h2>
          </div>
          <RiseLine index={2} className="max-w-xs">
            <span className="text-white/50 text-sm leading-relaxed">
              Real moments, real people, real encounters with God. Every Sunday is an invitation.
            </span>
          </RiseLine>
        </Reveal>

        {/* Bento photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ gridAutoRows: '200px' }}>
          {/* Large featured — 2×2 */}
          <Reveal variant="scale" className="col-span-2 row-span-2 rounded-2xl overflow-hidden group relative">
            <img
              src={PHOTOS[0]}
              alt="Ruach Tabernacle"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5">
              <span className="bg-[#BF0A30] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg" style={H}>
                Rhema Grounds
              </span>
            </div>
          </Reveal>

          {/* Grid tiles */}
          {PHOTOS.slice(1, 9).map((src, i) => (
            <Reveal key={i} variant="scale" delay={80 + i * 60} className="rounded-2xl overflow-hidden group relative">
              <img
                src={src}
                alt={`Ruach ${i + 2}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal variant="up" className="flex justify-center mt-10">
          <Link
            href="/new-here"
            className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-[rgba(191,10,48,0.35)]"
            style={H}
          >
            Plan Your Visit <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
