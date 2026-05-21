import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const LEADERSHIP = [
  {
    name: 'Rev. Julian Kyula',
    title: 'Founder & Overseer',
    bio: 'Bishop Julian is the visionary founder and overseer of Ruach Assemblies — a dedicated spiritual leader and highly successful serial entrepreneur who founded the MODE Group, a fintech company that expanded into 26 countries.',
    img: '/brand/rev-julian.png',
    href: '/our-team/rev-julian-kyula',
  },
  {
    name: 'Pst. Ekelemu Ewomazino',
    title: 'Senior Pastor',
    bio: 'Leading Ruach Tabernacle with a mandate to Raise Kingdom Champions — men and women intentional about pursuing their divine purpose in every sphere of influence, whether in ministry or the marketplace.',
    img: '/pastors/pst-zino-portrait.jpg',
    href: '/our-team/pst-zino',
  },
];

const ASSOCIATE_PASTORS = [
  {
    name: 'Pst. Emmanuel Mule',
    title: 'Elder · Worship Leader · Discipleship Mentor',
    img: '/pastors/pst-mule.jpeg',
    href: '/our-team/pst-mule',
  },
  {
    name: 'Pst. Maureen Wanjiku',
    title: 'Kingdom Woman Leader · Pastor · Director',
    img: '/pastors/pst-maureen.jpg',
    href: '/our-team/maureen-wanjiku',
  },
  {
    name: 'Rev Beverly Mwangombe',
    title: 'Care & Counselling Pastor · Psychotherapist',
    img: '/church-photos/rev-bev.jpeg',
    href: '/our-team/rev-beverly',
  },
  {
    name: 'Pst. Elizabeth Akinyi',
    title: 'Teacher · Pastor · Musician · Editor',
    img: '/church-photos/pst-liz.jpeg',
    href: '/our-team/elizabeth-akinyi',
  },
  {
    name: 'Pst. Kevin Owino',
    title: 'JKG Resident Pastor · Author · Ministerial Trainer',
    img: '/church-photos/silhouette.png',
    href: '/our-team/pst-kev-owino',
  },
  {
    name: 'Pst. Ivlyn Mutua',
    title: 'Pastor · Ministry Leader',
    img: '/pastors/pst-ivlyn.jpeg',
    href: '/our-team/pst-ivlyn-mutua',
  },
  {
    name: 'Pst. David Kimani',
    title: 'R Warriors President · Elder · Pastor · Editor',
    img: '/church-photos/silhouette.png',
    href: '/our-team/pst-david-kimani',
  },
];

const ELDER_BOARD: { name: string; title: string; img: string; href: string | null }[] = [
  {
    name: 'Pst. David Kimani',
    title: 'R Warriors President · Elder · Pastor · Editor',
    img: '/church-photos/silhouette.png',
    href: '/our-team/pst-david-kimani',
  },
  {
    name: 'Pst. Emmanuel Mule',
    title: 'Elder · Worship Leader · Discipleship Mentor',
    img: '/pastors/pst-mule.jpeg',
    href: '/our-team/pst-mule',
  },
  {
    name: 'Elder James Njoroge',
    title: 'Elder',
    img: '/pastors/Jamess.jpeg',
    href: null,
  },
  {
    name: 'Elder Kenn Alwena',
    title: 'Elder',
    img: '/church-photos/silhouette.png',
    href: null,
  },
];

export default function OurTeamPage() {
  return (
    <Layout
      title="Our Team"
      description="Meet the God-given team behind Ruach Tabernacle — our founder, senior pastor, associate pastors, and elder board."
    >

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[75vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/aug-2025-a.jpg"
            alt="Our Team"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
          <span className="text-[100px] md:text-[160px] italic text-white/5 whitespace-nowrap leading-none" style={H}>
            Meet the Team. &nbsp; Meet the Team.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-36 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-5" style={H}>
            R-Leadership
          </p>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white tracking-tight mb-6 leading-[1.05]" style={H}>
            Meet Our<br />
            <span style={serif}>God-given Team.</span>
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-lg leading-relaxed">
            Servant leaders committed to raising Kingdom Champions and building a community of purpose.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE — dark
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`a${i}`} className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight" style={H}>
                <span className="text-[#BF0A30]" style={serif}>Lead</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">Serve</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Inspire</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`b${i}`} className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight" style={H}>
                <span className="text-[#BF0A30]" style={serif}>Lead</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">Serve</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Inspire</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED LEADERSHIP — Rev Julian + Pst Zino
      ══════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden bg-[#0A0C10]">
        <div className="absolute inset-0">
          <img
            src="/church-photos/dark-background-3.png"
            alt=""
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-[#0A0C10]/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
              Senior Leadership
            </p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              Visionary<br />
              <span style={serif}>leadership.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {LEADERSHIP.map((m) => (
              <div
                key={m.href}
                className="rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(18,21,28,0.75)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/silhouette.png'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151C]/80 via-transparent to-transparent" />
                </div>
                <div className="p-8">
                  <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>
                    {m.title}
                  </p>
                  <p className="text-white font-black text-xl mb-4" style={H}>{m.name}</p>
                  <p className="text-[#8B95A8] text-sm leading-relaxed mb-6">{m.bio}</p>
                  <Link
                    href={m.href}
                    className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all"
                    style={H}
                  >
                    Read More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE — cream stroke
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-6 overflow-hidden border-y border-[#E0D8CE]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={`a${i}`} className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap" style={{ ...H, fontStyle: 'italic' }}>
                Our Pastors.
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={`b${i}`} className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap" style={{ ...H, fontStyle: 'italic' }}>
                Our Pastors.
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ASSOCIATE PASTORS — community card style
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
                Pastoral Team
              </p>
              <h2 className="text-4xl md:text-5xl text-[#111827] leading-tight" style={H}>
                Associate<br />
                <span style={{ ...serif, fontWeight: 700 }}>Pastors.</span>
              </h2>
            </div>
            <p className="text-[#6B7280] max-w-xs text-sm leading-relaxed">
              Faithful leaders serving our congregation across every department and ministry.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ASSOCIATE_PASTORS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group relative rounded-3xl overflow-hidden block"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={p.img}
                  alt={p.name}
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
                    <p className="text-white font-black text-sm leading-tight" style={H}>{p.name}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5 leading-snug">{p.title}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[#BF0A30] text-[10px] font-bold" style={H}>
                      Read More <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ELDER BOARD — dark, 3-col description + cards
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-16 items-start">

            {/* Left: description */}
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
                Governance
              </p>
              <h2 className="text-4xl md:text-5xl text-white mb-6 leading-tight" style={H}>
                Elder<br />
                <span style={serif}>Board.</span>
              </h2>
              <p className="text-[#8B95A8] text-sm leading-relaxed mb-4">
                The elders at Ruach Tabernacle serve as spiritual shepherds of our church body — providing
                theological guidance, prayerful leadership, and pastoral care, helping ensure the church
                remains rooted in Scripture and aligned with its mission.
              </p>
              <p className="text-[#8B95A8] text-sm leading-relaxed">
                Their role is not about authority for its own sake, but about servant leadership —
                modeling humility, wisdom, and integrity as they lead God&apos;s people.
              </p>
            </div>

            {/* Right: elder cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {ELDER_BOARD.map((e) => {
                const cardInner = (
                  <>
                    <img
                      src={e.img}
                      alt={e.name}
                      className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out ${e.href ? 'group-hover:scale-105' : ''}`}
                      onError={(ev) => { (ev.target as HTMLImageElement).src = '/church-photos/silhouette.png'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
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
                        <p className="text-white font-black text-sm leading-tight" style={H}>{e.name}</p>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5 leading-snug">{e.title}</p>
                        {e.href && (
                          <span className="mt-2 inline-flex items-center gap-1 text-[#BF0A30] text-[10px] font-bold" style={H}>
                            Read More <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );

                return e.href ? (
                  <Link
                    key={e.name}
                    href={e.href}
                    className="group relative rounded-3xl overflow-hidden block"
                    style={{ aspectRatio: '3/4' }}
                  >
                    {cardInner}
                  </Link>
                ) : (
                  <div
                    key={e.name}
                    className="relative rounded-3xl overflow-hidden"
                    style={{ aspectRatio: '3/4' }}
                  >
                    {cardInner}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

    </Layout>
  );
}
