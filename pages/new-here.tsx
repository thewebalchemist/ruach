import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

// Headline voice: Bricolage Grotesque; accent voice: Fraunces (upright serif)
const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

export default function NewHerePage() {
  return (
    <Layout
      title="New Here?"
      description="Planning your first visit to Ruach Tabernacle? Come as a guest, stay as family. We meet every Sunday at 8AM, 10AM and 12:30PM along the Northern Bypass, Windsor, Nairobi."
    >

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/IMG_1716.jpg"
            alt="Welcome to Ruach Tabernacle"
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
          <span
            className="text-[100px] md:text-[160px] text-white/5 whitespace-nowrap leading-none"
            style={H}
          >
            Welcome Home. &nbsp; Welcome Home.
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-36 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-5" style={H}>
            New Here?
          </p>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-[1.05] tracking-tight mb-6" style={H}>
            Come as a guest,<br />
            <span style={serif}>Stay as family.</span>
          </h1>
          <p className="text-[#8B95A8] text-lg mb-10 max-w-xl leading-relaxed">
            We meet every Sunday at 8:00AM, 10:00AM, and 12:30PM along the Northern
            Bypass, Windsor, Nairobi. You&apos;ll find people of all ages and walks of life.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-[rgba(191,10,48,0.4)]"
              style={H}
            >
              Get Directions <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/who-we-are"
              className="flex items-center gap-2 apple-glass-dark text-white font-bold text-sm uppercase tracking-wider px-7 py-4 transition-all hover:-translate-y-0.5"
              style={H}
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE 1 — Dark, matching homepage style
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={`a${i}`}
                className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight"
                style={H}
              >
                <span className="text-[#BF0A30]" style={serif}>You&apos;re</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">So</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Loved</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={`b${i}`}
                className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight"
                style={H}
              >
                <span className="text-[#BF0A30]" style={serif}>You&apos;re</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">So</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Loved</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          YOU'RE SO LOVED
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <h2 className="text-4xl md:text-5xl text-[#111827] leading-[1.1]" style={H}>
              You&apos;re So Loved<br />
              <span style={{ ...serif, fontWeight: 700 }}>and Valued.</span>
            </h2>
            <p className="text-[#6B7280] max-w-xs text-sm leading-relaxed">
              Our team is committed to making your first visit enjoyable and stress-free.
            </p>
          </div>

          <div className="flex flex-col gap-4">

            {/* ── ROW 1: Full-width service times banner */}
            <div className="rounded-3xl bg-[#111111] overflow-hidden relative">
              {/* Photo bleed on the right */}
              <div className="absolute right-0 top-0 bottom-0 w-2/5 md:w-1/3 pointer-events-none">
                <img
                  src="/church-photos/worship-ruach.jpg"
                  alt=""
                  className="w-full h-full object-cover opacity-40"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/60 to-transparent" />
              </div>

              <div className="relative p-8 md:p-10">
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-8" style={H}>
                  Every Sunday
                </p>
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-0">
                  {[
                    { n: 'First Service',  t: '8:00',  suf: 'AM'    },
                    { n: 'Second Service', t: '10:00', suf: 'AM'     },
                    { n: 'Third Service',  t: '12:30', suf: 'PM'     },
                  ].map((s, i) => (
                    <div key={s.n} className={`flex-1 ${i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-8 lg:pl-12' : ''}`}>
                      <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1.5" style={H}>{s.n}</p>
                      <p className="text-white leading-none flex items-baseline gap-2" style={H}>
                        <span className="text-[52px] md:text-[68px] lg:text-[80px]">{s.t}</span>
                        <span className="text-base text-white/40" style={serif}>{s.suf}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-white/15 text-[10px] uppercase tracking-wider mt-8" style={H}>
                  Rhema Grounds, Northern Bypass · next to Shell Windsor · Nairobi
                </p>
              </div>
            </div>

            {/* ── ROW 2: Location photo card + Connect card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Location — photo background */}
              <div className="rounded-3xl overflow-hidden relative min-h-[300px]">
                <img
                  src="/church-photos/aug-2025-a.jpg"
                  alt="Ruach Tabernacle"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest" style={H}>
                    Find Us
                  </p>
                  <div>
                    <p className="text-white font-black text-2xl mb-1" style={H}>Rhema Grounds</p>
                    <p className="text-white/55 text-sm mb-6">
                      Off Northern Bypass · next to Shell Windsor, Nairobi
                    </p>
                    <a
                      href="https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-[#111827] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl hover:bg-white/90 transition-colors"
                      style={H}
                    >
                      Get Directions <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Connect — red card */}
              <div className="rounded-3xl bg-[#BF0A30] p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-14 -left-8 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
                <div className="relative">
                  <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
                    Get Connected
                  </p>
                  <h3 className="text-white text-3xl md:text-4xl leading-tight" style={H}>
                    Ready to go<br />
                    <span style={serif}>deeper?</span>
                  </h3>
                  <p className="text-red-100/80 text-sm leading-relaxed mt-4">
                    Find your people. Join a Crosspoint, discover a ministry, and step into your God-given purpose.
                  </p>
                </div>
                <Link
                  href="/r-connect"
                  className="relative self-start inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all mt-8"
                  style={H}
                >
                  Explore Communities <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE 2 — Cream, stroke style like homepage
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-6 overflow-hidden border-y border-[#E0D8CE]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee-reverse_22s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={`a${i}`}
                className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap"
                style={{ ...H }}
              >
                Connect.
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee-reverse_22s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={`b${i}`}
                className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap"
                style={{ ...H }}
              >
                Connect.
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          KIDS — Dark background
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src="/kids/children-1.jpeg"
                alt="R-Kids Church"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-5" style={H}>
                R-Kids Church
              </p>
              <h2 className="text-4xl md:text-5xl text-white mb-6 leading-tight" style={H}>
                A place for your<br />
                <span style={serif}>kids to belong.</span>
              </h2>
              <p className="text-[#8B95A8] leading-relaxed mb-8">
                We&apos;re committed to providing your children a safe and welcoming environment
                where they can build a genuine relationship with Jesus — through games, interactive
                Bible lessons, and creative crafts led by thoroughly vetted volunteers.
              </p>
              <Link
                href="/r-kids-church"
                className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-all shadow-lg shadow-[rgba(191,10,48,0.3)]"
                style={H}
              >
                R-Kids Church <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LEADERSHIP WELCOME — Dark, redesigned
      ══════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden bg-[#0A0C10]">
        <div className="absolute inset-0">
          <img
            src="/church-photos/dark-background-3.png"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[#0A0C10]/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Section header */}
          <div className="mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
              A Word from Our Leaders
            </p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              Welcome to<br />
              <span style={serif}>the family.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Rev. Julian Kyula */}
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(18,21,28,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/pastors/rev-julian1.jpg"
                  alt="Rev. Julian Kyula"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/brand/rev-julian.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151C]/80 via-transparent to-transparent" />
              </div>
              <div className="p-8">
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>
                  Founder &amp; Overseer
                </p>
                <p className="text-white font-black text-lg mb-5" style={H}>Rev. Julian Kyula</p>
                <blockquote className="text-[#8B95A8] leading-relaxed text-sm" style={{ ...serif }}>
                  &ldquo;We started with a simple belief: that every person carries a God-given purpose.
                  Ruach exists to help you discover, develop, and deploy that purpose — in your family,
                  your work, and your community. We are so glad you are here.&rdquo;
                </blockquote>
              </div>
            </div>

            {/* Pst. Zino */}
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(18,21,28,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/pastors/pst-zino-portrait.jpg"
                  alt="Pst. Ekelemu Ewomazino"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/pastors/pst-zino.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151C]/80 via-transparent to-transparent" />
              </div>
              <div className="p-8">
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>
                  Senior Pastor
                </p>
                <p className="text-white font-black text-lg mb-5" style={H}>Pst. Ekelemu Ewomazino</p>
                <blockquote className="text-[#8B95A8] leading-relaxed text-sm" style={{ ...serif }}>
                  &ldquo;Whether you are searching for answers, healing, or simply looking for a place to belong —
                  you have found it. Ruach is a family built on faith, rooted in love, and committed to
                  walking with you every step of the way. Welcome home.&rdquo;
                </blockquote>
              </div>
            </div>

          </div>

          <div className="mt-10 flex justify-start">
            <Link
              href="/our-team"
              className="inline-flex items-center gap-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all"
              style={H}
            >
              Meet Our Team <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl text-white mb-4" style={H}>
            See you on<br /><span style={serif}>Sunday.</span>
          </h2>
          <p className="text-red-100 mb-8 leading-relaxed">
            Check out some of our upcoming events, or plan your first visit with us.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/r-events"
              className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Events Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Get Directions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <ExpectGallery />

    </Layout>
  );
}
