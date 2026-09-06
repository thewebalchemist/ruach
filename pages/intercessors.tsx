import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

export default function IntercessorsPage() {
  return (
    <Layout title="Intercessors — Ruach Tabernacle" description="The Intercessors prayer ministry of Ruach Tabernacle — standing in the gap for the church, the city, and the nations.">

      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background-2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/ruach1.jpg" alt="Intercessors" className="absolute inset-0 w-full h-full object-cover opacity-35"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '5%', filter: 'blur(120px)', opacity: 0.12, ['--spirit-dur' as string]: '15s' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Prayer Ministry</p>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-tight mb-4" style={H}>Intercessors</h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Standing in the gap. Holding the ground.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-5" style={H}>Who We Are</p>
            <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
              The praying<br />
              <span style={serif}>church.</span>
            </h2>
            <p className="text-[#374151] leading-relaxed mb-4">
              Our Intercessors ministry is the prayer engine of Ruach Tabernacle — a dedicated group of believers who carry the church, the city, and the nations before the throne of God in fervent, consistent prayer.
            </p>
            <p className="text-[#374151] leading-relaxed mb-8">
              We believe prayer is not a last resort — it is our first response. And we are committed to being a house of prayer for all nations.
            </p>
            <Link href="/pray" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
              Submit a Prayer Request <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
