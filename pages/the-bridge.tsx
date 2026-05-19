import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

export default function TheBridgePage() {
  return (
    <Layout title="The Bridge — Youth Church" description="The Bridge is Ruach Tabernacle's dynamic youth church — a community where young people encounter God, build purpose, and live boldly for the Kingdom.">

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background-2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/aug-2025-c.jpg" alt="The Bridge Youth Church" className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        {/* Spirit breath */}
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '5%', filter: 'blur(120px)', opacity: 0.12, ['--spirit-dur' as string]: '9s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Youth Church</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-4" style={H}>
            The Bridge
          </h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Where young people cross over into their God-given purpose.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-5" style={H}>Who We Are</p>
              <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
                A generation<br />
                <span style={serif}>rising up.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                The Bridge is Ruach Tabernacle&apos;s youth church — a vibrant, Spirit-filled community for young people who want to know God deeply, find their purpose, and make an impact in the world.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                We meet every Sunday alongside the main services, with dynamic worship, relevant teaching, and a community that truly does life together.
              </p>
              <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
                Join Us Sunday <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="/church-photos/worship1.jpg" alt="The Bridge" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
            </div>
          </div>
        </div>
      </section>

      <ExpectGallery />

    </Layout>
  );
}
