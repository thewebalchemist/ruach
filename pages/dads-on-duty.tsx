import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { Reveal, RiseLine } from '@/components/shared/Reveal';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

export default function DadsOnDutyPage() {
  return (
    <Layout title="Dads on Duty — Ruach Tabernacle" description="Dads on Duty — fathers who show up, step up, and lead with love.">

      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/worship-man.jpg" alt="Dads on Duty" className="absolute inset-0 w-full h-full object-cover opacity-35"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '5%', filter: 'blur(120px)', opacity: 0.10, ['--spirit-dur' as string]: '12s' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 pt-32 w-full">
          <Reveal variant="fade" as="p" className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Ministry</Reveal>
          <Reveal variant="none" as="h1" className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-tight mb-4" style={H}>
            <RiseLine index={0}>Dads</RiseLine>
            <RiseLine index={1}>on Duty</RiseLine>
          </Reveal>
          <Reveal variant="blur" delay={350} as="p" className="text-white/60 text-lg max-w-lg" style={serif}>
            Present. Intentional. Kingdom fathers.
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-2xl">
            <Reveal variant="fade" as="p" className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-5" style={H}>Who We Are</Reveal>
            <Reveal variant="none" as="h2" className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
              <RiseLine index={0}>Fathers who</RiseLine>
              <RiseLine index={1}><span style={serif}>show up.</span></RiseLine>
            </Reveal>
            <Reveal variant="blur" delay={200} as="p" className="text-[#374151] leading-relaxed mb-4">
              Dads on Duty is a brotherhood of fathers committed to being present, intentional, and Kingdom-minded in their homes. We believe that when fathers lead well, families thrive and generations are transformed.
            </Reveal>
            <Reveal variant="blur" delay={300} as="p" className="text-[#374151] leading-relaxed mb-8">
              Join us as we learn from the Word, encourage each other, and take our God-given place as the spiritual leaders of our households.
            </Reveal>
            <Reveal variant="up" delay={400}>
              <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
                Connect With Us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

    </Layout>
  );
}
