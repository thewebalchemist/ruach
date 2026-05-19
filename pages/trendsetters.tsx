import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

export default function TrendsetttersPage() {
  return (
    <Layout title="Trendsetters — Teens Church" description="Trendsetters is Ruach Tabernacle's dynamic teens church — where young people discover identity, purpose, and belonging in God.">

      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background-3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/ruach3.jpg" alt="Trendsetters" className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '5%', filter: 'blur(120px)', opacity: 0.12, ['--spirit-dur' as string]: '8s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Teens Church</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-4" style={H}>Trendsetters</h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Not followers of the world — setters of the trend.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-5" style={H}>Who We Are</p>
            <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
              Teens who<br />
              <span style={serif}>set the standard.</span>
            </h2>
            <p className="text-[#374151] leading-relaxed mb-4">
              Trendsetters is Ruach Tabernacle&apos;s teens ministry — a bold community where young people aged 13–17 discover who they are in God, find real belonging, and choose to live differently.
            </p>
            <p className="text-[#374151] leading-relaxed mb-8">
              We meet every Sunday with relevant teaching, vibrant worship, and a community that makes faith real for the teenage journey.
            </p>
            <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
              Join Us Sunday <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
