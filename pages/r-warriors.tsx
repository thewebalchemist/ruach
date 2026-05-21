import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const ACTIVITIES = [
  {
    title: 'Accountability Groups',
    desc: 'Small, intentional groups of men who hold each other to a higher standard — in faith, in family, and in every aspect of life. Iron sharpens iron.',
  },
  {
    title: 'Bible Study',
    desc: 'Deep, practical engagement with the Word of God. We study together and apply the Scriptures to the real challenges and responsibilities men face daily.',
  },
  {
    title: 'Mentorship',
    desc: 'Older men investing in younger men. We build a culture of legacy — passing on wisdom, godly character, and Kingdom values from generation to generation.',
  },
];

const PHOTOS = [
  { img: '/communities/r-warriors.jpg',       name: 'R-Warriors',      subtitle: "Men's Ministry" },
  { img: '/church-photos/worship-man.jpg',     name: 'Men of God',      subtitle: 'Standing Strong' },
  { img: '/church-photos/worship-man2.jpg',    name: 'Brotherhood',     subtitle: 'Forged Together' },
];

export default function RWarriorsPage() {
  return (
    <Layout
      title="R-Warriors — Men Ministry"
      description="R-Warriors is Ruach Tabernacle's men's ministry — forging men of God who lead with integrity, strength, and Kingdom purpose."
    >

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/worship-man.jpg"
            alt="R-Warriors Men Ministry"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/communities/r-warriors.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/55 to-transparent" />
        </div>
        <div
          className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '5%', right: '-5%', filter: 'blur(150px)', opacity: 0.09, ['--spirit-dur' as string]: '11s' }}
        />
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span
            className="text-[100px] md:text-[160px] text-white/[0.04] whitespace-nowrap leading-none select-none"
            style={{ ...H, fontStyle: 'italic' }}
          >
            R-Warriors. &nbsp; R-Warriors.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 pt-36 w-full">
          <span
            className="inline-block mb-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/15"
            style={{ ...H, background: 'rgba(191,10,48,0.18)' }}
          >
            Men Ministry
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white tracking-tight leading-tight mb-4" style={H}>
            R-Warriors
          </h1>
          <p className="text-white/55 text-lg max-w-lg" style={serif}>
            Men of God. Men of character. Men who lead.
          </p>
        </div>
      </section>

      {/* DARK MARQUEE */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          {[0, 1].map(t => (
            <div
              key={t}
              className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]"
              aria-hidden
            >
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight"
                  style={H}
                >
                  <span className="text-[#BF0A30]" style={serif}>Strength</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-white/80">Integrity</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-[#BF0A30]" style={serif}>Purpose</span>
                  <span className="text-white/10 text-lg">—</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest mb-5" style={H}>Who We Are</p>
              <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
                Forged for <br />
                <span style={serif}>the Kingdom.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                R-Warriors is Ruach Tabernacle&apos;s men&apos;s ministry — a brotherhood forging men of God who are grounded in the Word, accountable to one another, and leading with integrity in every arena of life: their homes, workplaces, and communities.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                We believe in men who are present, intentional, and purpose-driven. Through fellowship, mentorship, and the Word, we sharpen each other as iron sharpens iron — building a legacy that extends to the next generation.
              </p>
              <Link
                href="/new-here"
                className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]"
                style={H}
              >
                Join Us Sunday <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {/* Right — activity cards */}
            <div className="space-y-4">
              {ACTIVITIES.map((a) => (
                <div key={a.title} className="bg-white rounded-2xl p-6 border border-[#E5E0D5]">
                  <h3 className="text-[#111827] text-base font-black mb-2" style={H}>{a.title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CREAM STROKE MARQUEE */}
      <section className="bg-[#F5F0E8] py-6 overflow-hidden border-y border-[#E0D8CE]">
        <div className="flex">
          {[0, 1].map(t => (
            <div
              key={t}
              className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]"
              aria-hidden
            >
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap"
                  style={{ ...H, fontStyle: 'italic' }}
                >
                  R-Warriors.
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PHOTO GRID */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-12">
            <p className="text-[#BF0A30] text-xs font-black uppercase tracking-widest mb-3" style={H}>Our Community</p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              Life at R-Warriors
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PHOTOS.map((card) => (
              <Link
                key={card.name}
                href="/new-here"
                className="group relative rounded-3xl overflow-hidden block"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={card.img}
                  alt={card.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/silhouette.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgba(10,12,16,0.7)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <p className="text-white font-black text-sm leading-tight" style={H}>{card.name}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{card.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl text-white mb-4 leading-tight" style={H}>
            Join R-Warriors.
          </h2>
          <p className="text-white/70 text-base mb-10 max-w-lg mx-auto" style={serif}>
            The brotherhood is waiting. Walk with men who are walking with God.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/new-here"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#BF0A30] font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-[#F5F0E8] transition-colors shadow-xl"
              style={H}
            >
              Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/r-communities"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:border-white/70 transition-colors"
              style={H}
            >
              Explore Communities <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
