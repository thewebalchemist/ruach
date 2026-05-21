import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const COMMUNITIES = [
  { name: 'R-Kids Church',        sub: 'Children Ministry',   href: '/r-kids-church',     img: '/communities/r-kids.jpeg' },
  { name: 'Trendsetters',         sub: 'Teens Church',         href: '/trendsetters',      img: '/communities/the-bridge2.jpg' },
  { name: 'The Bridge',           sub: 'Youth Church',         href: '/the-bridge',        img: '/communities/the-bridge.jpg' },
  { name: 'Crosspoints',          sub: 'Home Church',          href: '/r-crosspoints',     img: '/communities/ruach2.jpg' },
  { name: 'R-Warriors',           sub: "Men's Ministry",       href: '/r-warriors',        img: '/communities/r-warriors.jpg' },
  { name: 'Kingdom Woman',        sub: "Women's Ministry",     href: '/kingdom-woman',     img: '/communities/kingdom-woman2.jpg' },
  { name: 'Marriage Ministry',    sub: 'Marriages & Families', href: '/marriage-ministry', img: '/communities/marriage.jpg' },
  { name: 'R-Worship',            sub: 'Worship Team',         href: '/r-worship',         img: '/communities/r-worship-praise.jpg' },
  { name: 'R-Media',              sub: 'Production & Media',   href: '/r-media',           img: '/communities/r-media.jpg' },
  { name: 'Intercessors',         sub: 'Prayer Ministry',      href: '/intercessors',      img: '/communities/ruach2.jpg' },
  { name: 'Evangelists',          sub: 'Outreach Ministry',    href: '/r-communities',     img: '/communities/worship1.jpg' },
  { name: 'Hospitality',          sub: 'Guest Services',       href: '/r-communities',     img: '/communities/the-bridge1.jpg' },
  { name: 'Care and Counselling', sub: 'Pastoral Care',        href: '/r-communities',     img: '/communities/kingdom-woman3.jpg' },
  { name: 'Guest Experience',     sub: 'First Impressions',    href: '/r-communities',     img: '/communities/r-worship-praise2.jpg' },
];

export default function RCommunitiesPage() {
  return (
    <Layout
      title="R-Communities"
      description="Find your circle at Ruach Tabernacle. Real community. Real growth. Real purpose — communities for kids, teens, youth, men, women, and more."
    >

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/aug-2025-a.jpg"
            alt="R-Communities"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/rhema-feast.jpg'; }}
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
            R-Communities. &nbsp; R-Communities.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 pt-36 w-full">
          <span
            className="inline-block mb-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/15"
            style={{ ...H, background: 'rgba(191,10,48,0.18)' }}
          >
            R-Communities
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white tracking-tight leading-tight mb-4" style={H}>
            Find Your <br />
            <span style={serif}>Circle.</span>
          </h1>
          <p className="text-white/55 text-lg max-w-md" style={serif}>
            Real community. Real growth. Real purpose.
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
                  <span className="text-[#BF0A30]" style={serif}>Connect</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-white/80">Grow</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-[#BF0A30]" style={serif}>Serve</span>
                  <span className="text-white/10 text-lg">—</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* TAGLINE SECTION */}
      <section className="bg-[#F5F0E8] py-14 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl md:text-4xl text-[#111827] mb-5 leading-tight" style={H}>
            Have people to do life with!
          </h2>
          <p className="text-[#6B7280] leading-relaxed text-base">
            We believe that real life change and growth happens through authentic relationships. You can&apos;t do life with everyone, but we can create a world where everyone has someone to do life with. Find your community at Ruach Tabernacle.
          </p>
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
                  Join Community.
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITIES GRID */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-12">
            <p className="text-[#BF0A30] text-xs font-black uppercase tracking-widest mb-3" style={H}>Find Your Place</p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              All Communities
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {COMMUNITIES.map((c) => (
              <Link
                key={`${c.href}-${c.name}`}
                href={c.href}
                className="group relative rounded-3xl overflow-hidden block aspect-square"
              >
                <img
                  src={c.img}
                  alt={c.name}
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
                    <p className="text-white font-black text-sm leading-tight" style={H}>{c.name}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">{c.sub}</p>
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
            Your community is waiting.
          </h2>
          <p className="text-white/70 text-base mb-10 max-w-lg mx-auto" style={serif}>
            There&apos;s a place for you here. Take the first step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/new-here"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#BF0A30] font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-[#F5F0E8] transition-colors shadow-xl"
              style={H}
            >
              New Here? <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/new-here"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:border-white/70 transition-colors"
              style={H}
            >
              Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
