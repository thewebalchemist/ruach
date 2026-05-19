import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

export default function RMediaPage() {
  return (
    <Layout title="R-Media — Ruach Tabernacle" description="R-Media is the media and production team of Ruach Tabernacle — telling the Ruach story through sound, visuals, and digital presence.">

      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background-3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/media-ruach.jpg" alt="R-Media" className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '5%', filter: 'blur(120px)', opacity: 0.10, ['--spirit-dur' as string]: '11s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Media & Production</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-4" style={H}>R-Media</h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Every frame a testimony. Every sound an act of worship.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-5" style={H}>Who We Are</p>
            <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
              Telling the<br />
              <span style={serif}>Ruach story.</span>
            </h2>
            <p className="text-[#374151] leading-relaxed mb-4">
              R-Media is the creative and production backbone of Ruach Tabernacle — a team of skilled communicators, designers, videographers, and technicians who serve the vision of the house through excellent media.
            </p>
            <p className="text-[#374151] leading-relaxed mb-8">
              We believe creativity is a gift from God, and we are committed to using ours to extend the reach and impact of the gospel.
            </p>
            <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
              Get Involved <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
