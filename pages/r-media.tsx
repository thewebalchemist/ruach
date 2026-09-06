import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

const ACTIVITIES = [
  {
    title: 'Live Production',
    desc: 'From audio engineering to camera operation and live stream — our production team ensures every service is delivered with excellence, in the building and online.',
  },
  {
    title: 'Design & Branding',
    desc: 'A creative team of designers who shape the visual identity of Ruach Tabernacle — bringing the vision of the house to life through compelling, purposeful design.',
  },
  {
    title: 'Digital & Social Media',
    desc: 'We extend the reach of the gospel through platforms, content, and storytelling that connects people to the life and message of Ruach Tabernacle online.',
  },
];

const PHOTOS = [
  { img: '/communities/r-media.jpg',       name: 'R-Media',             subtitle: 'Media & Production' },
  { img: '/church-photos/media-ruach.jpg', name: 'Behind the Scenes',   subtitle: 'Serving the Vision' },
  { img: '/church-photos/worship1.jpg',    name: 'Every Frame Matters',  subtitle: 'Every Sound an Act of Worship' },
];

export default function RMediaPage() {
  return (
    <Layout
      title="R-Media — Media & Production"
      description="R-Media is the media and production team of Ruach Tabernacle — telling the Ruach story through sound, visuals, and digital presence."
    >

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/media-ruach.jpg"
            alt="R-Media"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/communities/r-media.jpg'; }}
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
            style={H}
          >
            R-Media. &nbsp; R-Media. &nbsp; R-Media.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 pt-36 w-full">
          <span
            className="inline-block mb-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/15"
            style={{ ...H, background: 'rgba(191,10,48,0.18)' }}
          >
            Media &amp; Production
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white tracking-tight leading-tight mb-4" style={H}>
            R-Media
          </h1>
          <p className="text-white/55 text-lg max-w-lg" style={serif}>
            Every frame a testimony. Every sound an act of worship.
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
                  <span className="text-[#BF0A30]" style={serif}>Create</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-white/80">Serve</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-[#BF0A30]" style={serif}>Amplify</span>
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
                Telling the <br />
                <span style={serif}>Ruach story.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                R-Media is the creative and production backbone of Ruach Tabernacle — a team of skilled communicators, designers, videographers, and technicians who serve the vision of the house through excellent, purposeful media.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                We believe creativity is a gift from God, and we are committed to using ours to extend the reach and impact of the gospel. Whether it&apos;s a live Sunday broadcast, a social media post, or a brand design — we do it all with excellence as an act of worship.
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
                  style={H}
                >
                  R-Media.
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
              Life at R-Media
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

      {/* VOLUNTEER CTA CARD */}
      <section className="bg-[#0A0C10] pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
          <div
            className="rounded-3xl p-10 md:p-14"
            style={{
              background: 'rgba(18,21,28,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest mb-4" style={H}>Serve With Us</p>
            <h3 className="text-white text-3xl md:text-4xl mb-4 leading-tight" style={H}>
              Want to serve on the <br />
              <span style={serif}>media team?</span>
            </h3>
            <p className="text-white/60 leading-relaxed mb-8 max-w-xl">
              We&apos;re always looking for committed, creative people who love God and want to use their gifts to serve the House. Whether you&apos;re into cameras, design, audio, or social media — there&apos;s a role for you here.
            </p>
            <Link
              href="/new-here"
              className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]"
              style={H}
            >
              Get Involved <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl text-white mb-4 leading-tight" style={H}>
            Get Involved in R-Media.
          </h2>
          <p className="text-white/70 text-base mb-10 max-w-lg mx-auto" style={serif}>
            Your creativity has a Kingdom purpose. Come serve with us.
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
