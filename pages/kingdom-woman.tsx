import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

export default function KingdomWomanPage() {
  return (
    <Layout title="Kingdom Woman — Women Ministry" description="Kingdom Woman is Ruach Tabernacle's women's ministry — a community where women are empowered, rooted in faith, and rising in purpose.">

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background-2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/worship-ruach.jpg" alt="Kingdom Woman" className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '5%', filter: 'blur(120px)', opacity: 0.10, ['--spirit-dur' as string]: '11s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Women Ministry</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-4" style={H}>
            Kingdom Woman
          </h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Rooted in faith. Refined in grace. Rising in purpose.
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
                Women who know<br />
                <span style={serif}>their worth.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                Kingdom Woman is Ruach Tabernacle&apos;s women&apos;s ministry — a vibrant community where women of all ages are empowered to discover who they are in God, strengthen their faith, and live with kingdom purpose.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                Through fellowship, prayer, teaching, and sisterhood, we walk together — building women who are not just surviving, but thriving in every area of life.
              </p>
              <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
                Join Us Sunday <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="/church-photos/ruach2.jpg" alt="Kingdom Woman" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="bg-[#000] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-16">
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>What We Stand On</p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              Built on<br />
              <span style={serif}>three pillars.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Faith', body: 'Grounded in the Word, we build women whose trust in God is unshakeable — in every season, every storm, every triumph.' },
              { title: 'Sisterhood', body: 'No woman walks alone. Kingdom Woman is a community of real relationships, accountability, and love that goes beyond Sunday.' },
              { title: 'Purpose', body: 'Every woman carries a God-given assignment. We help you uncover it, pursue it, and step fully into the life God designed for you.' },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-8 border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <h3 className="text-2xl text-white mb-4" style={H}>{p.title}</h3>
                <p className="text-white/60 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ExpectGallery />

    </Layout>
  );
}
