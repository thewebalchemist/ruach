import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

export default function RWarriorsPage() {
  return (
    <Layout title="R-Warriors — Men Ministry" description="R-Warriors is Ruach Tabernacle's men's ministry — forging men of God who lead with integrity, strength, and Kingdom purpose.">

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/worship-man.jpg" alt="R-Warriors" className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[600px] h-[600px] bg-[#BF0A30]"
          style={{ top: '5%', right: '-5%', filter: 'blur(140px)', opacity: 0.10, ['--spirit-dur' as string]: '13s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Men Ministry</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-4" style={H}>
            R-Warriors
          </h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Men of God. Men of character. Men who lead.
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
                Forged for<br />
                <span style={serif}>the Kingdom.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                R-Warriors is Ruach Tabernacle&apos;s men&apos;s ministry — a brotherhood forging men of God who are grounded in the Word, accountable to one another, and leading with integrity in every arena of life.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                We believe in men who are present — in their homes, their communities, and the Kingdom. Through fellowship, mentorship, and the Word, we sharpen each other as iron sharpens iron.
              </p>
              <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
                Join Us Sunday <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="/church-photos/worship-man2.jpg" alt="R-Warriors" className="w-full h-full object-cover"
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
              Three marks of<br />
              <span style={serif}>a warrior.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Integrity', body: 'A warrior\'s word is his bond. We build men who are the same in private as they are in public — consistent, trustworthy, and anchored in truth.' },
              { title: 'Brotherhood', body: 'No man is meant to walk alone. R-Warriors is a band of brothers who sharpen each other, hold each other accountable, and do life together.' },
              { title: 'Legacy', body: 'We are building men who think beyond themselves — fathers, leaders, and servants who leave a Kingdom legacy for the next generation.' },
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
