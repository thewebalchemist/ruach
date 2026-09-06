import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

const PROGRAMS = [
  {
    name: 'Little Angels',
    age: 'Ages 0–2',
    desc: 'A safe and nurturing nursery environment for your tiniest members. Trained and vetted volunteers provide loving care for your infants and toddlers while you worship.',
  },
  {
    name: 'Sparks',
    age: 'Ages 3–5',
    desc: 'A vibrant space where pre-schoolers discover Jesus through play, catchy songs, and interactive Bible stories that stay in their hearts all week.',
  },
  {
    name: 'Disciples',
    age: 'Ages 6–9',
    desc: 'Engaging lessons, fun games, and creative crafts that help early elementary children build a solid, lasting foundation in God\'s Word.',
  },
  {
    name: 'Redeemers',
    age: 'Ages 10–12',
    desc: 'Dynamic teaching and age-appropriate activities that challenge pre-teens to own their faith, ask the hard questions, and live it out boldly.',
  },
];

const PHOTOS = [
  { img: '/communities/r-kids.jpeg',              name: 'R-Kids Church',       subtitle: 'Children Ministry' },
  { img: '/church-photos/IMG_1716.jpg',           name: 'Growing Together',    subtitle: 'Every Sunday' },
  { img: '/church-photos/advancing-kingdom.jpg',  name: 'Raising Champions',   subtitle: 'For the Kingdom' },
];

export default function RKidsChurchPage() {
  return (
    <Layout
      title="R-Kids Church — Children Ministry"
      description="R-Kids Church is a safe, fun space where kids aged 0–12 discover Jesus. Ruach Tabernacle's children's ministry — where kids belong."
    >

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/kids/children-1.jpeg"
            alt="R-Kids Church"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).src = '/communities/r-kids.jpeg'; }}
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
            R-Kids. &nbsp; R-Kids. &nbsp; R-Kids.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 pt-36 w-full">
          <span
            className="inline-block mb-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/15"
            style={{ ...H, background: 'rgba(191,10,48,0.18)' }}
          >
            Children Ministry
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white tracking-tight leading-tight mb-4" style={H}>
            R-Kids <br />
            <span style={serif}>Church</span>
          </h1>
          <p className="text-white/55 text-lg max-w-md" style={serif}>
            A safe, fun space where kids discover Jesus.
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
                  <span className="text-[#BF0A30]" style={serif}>Faith</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-white/80">Fun</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-[#BF0A30]" style={serif}>Family</span>
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
                Where kids <br />
                <span style={serif}>belong.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                At R-Kids Church, we believe every child is uniquely created by God with a purpose and a destiny. Our goal is to create an environment where kids feel loved, safe, and genuinely excited to learn about Jesus — in a way that speaks to them at their level.
              </p>
              <p className="text-[#374151] leading-relaxed mb-4">
                We partner with parents to raise a generation that knows God, loves His Word, and carries His presence wherever they go. Each age group is served by trained, passionate volunteers who make every Sunday an experience your child will look forward to.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                From songs and crafts to Bible lessons and games — R-Kids is where faith becomes fun and lifelong.
              </p>
              <Link
                href="/new-here"
                className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]"
                style={H}
              >
                Join Us Sunday <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {/* Right — program cards */}
            <div className="space-y-4">
              {PROGRAMS.map((p) => (
                <div key={p.name} className="bg-white rounded-2xl p-6 border border-[#E5E0D5]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[#111827] text-base font-black" style={H}>{p.name}</h3>
                    <span
                      className="text-[#BF0A30] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#BF0A30]/20"
                      style={H}
                    >
                      {p.age}
                    </span>
                  </div>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{p.desc}</p>
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
                  Kids Church.
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
              Life at R-Kids
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

      {/* SAFETY NOTE */}
      <section className="bg-[#F5F0E8] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div
            className="rounded-3xl p-10"
            style={{
              background: 'rgba(18,21,28,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#BF0A30]/15 flex items-center justify-center">
                <Shield className="w-7 h-7 text-[#BF0A30]" />
              </div>
            </div>
            <h3 className="text-white text-2xl mb-3 leading-tight" style={H}>
              Every volunteer is vetted.
            </h3>
            <p className="text-white/60 leading-relaxed text-sm max-w-xl mx-auto">
              Your child&apos;s safety is our highest priority. Every R-Kids volunteer goes through a thorough background check, safeguarding training, and a structured onboarding process before serving with children. We follow strict protocols to ensure every child is safe, seen, and cared for.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl text-white mb-4 leading-tight" style={H}>
            Bring your kids this Sunday.
          </h2>
          <p className="text-white/70 text-base mb-10 max-w-lg mx-auto" style={serif}>
            A safe, exciting environment where your children will love coming back every week.
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
