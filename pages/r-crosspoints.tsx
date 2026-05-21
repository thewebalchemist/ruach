import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

export default function RCrosspointsPage() {
  return (
    <Layout
      title="R-Crosspoints — Small Groups"
      description="R-Crosspoints are Ruach Tabernacle's small groups — where real community, discipleship, and life happen beyond Sunday."
    >

      {/* HERO */}
      <section className="relative min-h-[65vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/communities/ruach2.jpg"
            alt="R-Crosspoints Small Groups"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship-ruach.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>

        {/* Spirit orb */}
        <div
          className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '5%', right: '-5%', filter: 'blur(150px)', opacity: 0.09, ['--spirit-dur' as string]: '11s' }}
        />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
          <span className="text-[100px] md:text-[160px] italic text-white/5 whitespace-nowrap leading-none" style={H}>
            Crosspoints. &nbsp; Crosspoints.
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-36 w-full">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white border border-white/15 bg-white/5 mb-6"
            style={H}
          >
            Small Groups
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-[1.05] tracking-tight mb-5" style={H}>
            R-Crosspoints
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-md leading-relaxed" style={serif}>
            Where Sunday becomes every day.
          </p>
        </div>
      </section>

      {/* DARK MARQUEE — Community · Fellowship · Prayer */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          {[0, 1].map(t => (
            <div key={t} className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight"
                  style={H}
                >
                  <span className="text-[#BF0A30]" style={serif}>Community</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-white/80">Fellowship</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-[#BF0A30]" style={serif}>Prayer</span>
                  <span className="text-white/10 text-lg">—</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* WHAT ARE CROSSPOINTS */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-5" style={H}>
                What Are Crosspoints?
              </p>
              <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
                Community<br />
                <span style={serif}>beyond Sunday.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                R-Crosspoints are Ruach Tabernacle&apos;s small groups — intimate gatherings of 10–20 people meeting weekly in homes, offices, and community spaces across Nairobi.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                This is where real relationships are built, where the Word comes alive in everyday life, and where you are known — not just as a face in a crowd, but as a person with a name, a story, and a purpose.
              </p>
              <Link
                href="/r-connect"
                className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]"
                style={H}
              >
                Find a Crosspoint <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Bible Study', desc: 'Deep dive into the Word together — questions welcome, growth guaranteed. Every Crosspoint is grounded in Scripture.' },
                { label: 'Prayer', desc: 'Real prayer for real needs. Crosspoints carry each other before the throne, believing for breakthroughs together.' },
                { label: 'Fellowship', desc: 'Life together — meals, laughter, and showing up for one another in the everyday moments that matter most.' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-6 border border-[#E5E0D5]">
                  <h3 className="text-lg text-[#111827] mb-2" style={H}>{item.label}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { stat: '10–20', label: 'People per group', desc: 'Small enough to truly know each other. Big enough to make an impact.' },
              { stat: 'Every week', label: 'Across Nairobi', desc: 'Groups meeting throughout the week in homes and community spaces.' },
              { stat: 'For every zone', label: 'Near you', desc: 'Whether you\'re in Westlands, Karen, Eastlands or anywhere in between.' },
            ].map((item) => (
              <div
                key={item.stat}
                className="rounded-2xl p-8"
                style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-[#BF0A30] text-4xl md:text-5xl font-black mb-2 leading-none" style={H}>{item.stat}</p>
                <p className="text-white font-bold text-sm uppercase tracking-widest mb-3" style={H}>{item.label}</p>
                <p className="text-[#8B95A8] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREAM STROKE MARQUEE — Find Your Crosspoint. */}
      <section className="bg-[#F5F0E8] py-6 overflow-hidden border-y border-[#E0D8CE]">
        <div className="flex">
          {[0, 1].map(t => (
            <div key={t} className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]" aria-hidden>
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap"
                  style={{ ...H, fontStyle: 'italic' }}
                >
                  Find Your Crosspoint.
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO JOIN */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
              Getting Started
            </p>
            <h2 className="text-4xl md:text-5xl text-[#111827] leading-tight" style={H}>
              How to<br />
              <span style={serif}>join a Crosspoint.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Attend Connect Class',
                desc: 'Start by attending the R-Connect Class where you\'ll be introduced to the Ruach Tabernacle family, our vision, and how Crosspoints work.',
              },
              {
                step: '02',
                title: 'Get Matched to a Group',
                desc: 'After Connect Class, you\'ll be matched with a Crosspoint group in your zone — close to home, so community fits naturally into your week.',
              },
              {
                step: '03',
                title: 'Show Up and Become Family',
                desc: 'Come to your first meeting, meet your group, and experience what it means to truly belong. Crosspoints are a place to be fully known and loved.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-8 border border-[#E5E0D5] relative overflow-hidden">
                <div
                  className="absolute top-4 right-4 text-[#111827]/[0.04] leading-none select-none pointer-events-none"
                  style={{ ...H, fontSize: '100px' }}
                  aria-hidden
                >
                  {s.step}
                </div>
                <div className="relative">
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#BF0A30] text-white text-xs font-black mb-5"
                    style={H}
                  >
                    {s.step}
                  </span>
                  <h3 className="text-[#111827] text-xl mb-3" style={H}>{s.title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl text-white mb-4" style={H}>
            Ready to find your<br />
            <span style={serif}>Crosspoint?</span>
          </h2>
          <p className="text-red-100 mb-8 leading-relaxed">
            Start with Connect Class and get matched to a group in your zone.
          </p>
          <Link
            href="/r-connect"
            className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
            style={H}
          >
            Join Connect Class <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </Layout>
  );
}
