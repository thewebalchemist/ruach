import Link from 'next/link';
import { ArrowRight, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const FAQS = [
  { q: 'What are your services like?', a: 'We provide an inviting atmosphere where everyone is welcome. Our services are a little over an hour long — filled with powerful worship, practical teachings that will help grow your faith in God, and a community of people that want to do life with you.' },
  { q: 'What should I wear?', a: 'We welcome you to come as you are. Whether you prefer to dress up or dress down, we encourage you to wear modestly and decently. Come comfortable.' },
  { q: 'How is it like visiting for the first time?', a: "We are committed to making sure that your first visit is enjoyable and stress-free. We won't single you out, make you stand up, or pressure you for money. Explore at your own pace." },
  { q: 'What about my kids?', a: "We know that your children are a big priority. We aim to create a safe, fun, and engaging environment through RT Kids — with games, interactive Bible lessons, and creative crafts. All volunteers are thoroughly vetted." },
  { q: 'How can I get connected?', a: 'Getting connected is easy! Attend our Connect Class to learn everything about Ruach, or join a Crosspoint (home church) where you can connect with people in your zone and grow in your faith.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-bold text-white text-sm" style={H}>{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 text-[#8B95A8] text-sm leading-relaxed bg-white/[0.03]">{a}</div>
      )}
    </div>
  );
}

export default function RConnectPage() {
  return (
    <Layout
      title="R-Connect — Your Pathway"
      description="Connect to your purpose at Ruach Tabernacle. Know, Grow, Serve — the Ruach pathway from Connect Class through Discipleship to Service."
    >

      {/* HERO */}
      <section className="relative min-h-[65vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/advancing-kingdom.jpg"
            alt="R-Connect — Connect to Your Purpose"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }}
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
          <span className="text-[110px] md:text-[170px] italic text-white/5 whitespace-nowrap leading-none" style={H}>
            R-Connect. &nbsp; R-Connect.
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-36 w-full">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white border border-white/15 bg-white/5 mb-6"
            style={H}
          >
            R-Connect
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-[1.05] tracking-tight mb-5" style={H}>
            Connect to<br />
            <span style={serif}>Your Purpose</span>
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-md leading-relaxed">
            Know · Grow · Serve — the Ruach pathway.
          </p>
        </div>
      </section>

      {/* DARK MARQUEE — Know · Grow · Serve */}
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
                  <span className="text-[#BF0A30]" style={serif}>Know</span>
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

      {/* 3-STEP PATHWAY */}
      <section className="bg-[#0A0C10] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
              Your Journey Starts Here
            </p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              The Ruach<br />
              <span style={serif}>Pathway.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              {
                step: '01',
                label: 'KNOW THE VISION',
                title: 'Connect Class',
                desc: 'Connect Classes are designed to help you understand who we are as the Ruach Tabernacle family — our vision, mission, core values, belief system, and leadership. It\'s the best first step.',
                href: '/new-here',
              },
              {
                step: '02',
                label: 'GROW IN THE WORD',
                title: 'Discipleship',
                desc: 'Our Discipleship Classes nurture your spiritual growth by feeding your spirit with the Word of God consistently. As you grow, you step into greater responsibility and deeper faith.',
                href: '/discipleship',
              },
              {
                step: '03',
                label: 'JOIN THE VISION',
                title: 'Serve',
                desc: 'After the classes you can partner in God\'s work by serving and committing yourself to one of the departments or communities. Find where your gifts fit.',
                href: '/r-communities',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl p-8 overflow-hidden"
                style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Watermark step number */}
                <div
                  className="absolute top-4 right-4 text-white/[0.04] leading-none select-none pointer-events-none"
                  style={{ ...H, fontSize: '120px' }}
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
                  <p className="text-[#8B95A8] text-[10px] font-bold uppercase tracking-widest mb-2" style={H}>
                    {s.label}
                  </p>
                  <h3 className="text-white text-2xl mb-3" style={H}>{s.title}</h3>
                  <p className="text-[#8B95A8] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Join Connect CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#BF0A30]/10 border border-[#BF0A30]/20 rounded-2xl px-8 py-6">
            <div>
              <p className="text-white font-black text-xl leading-tight mb-1" style={H}>Ready to take the first step?</p>
              <p className="text-[#8B95A8] text-sm">Register for the next Connect Class and begin your Ruach journey.</p>
            </div>
            <Link
              href="/connect/register"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-[rgba(191,10,48,0.35)] whitespace-nowrap"
              style={H}
            >
              Join Connect <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CREAM STROKE MARQUEE — You're Family. */}
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
                  You&apos;re Family.
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITIES PREVIEW */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-12">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
              R-Communities
            </p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              A place for<br />
              <span style={serif}>everyone.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'R-Kids Church', sub: 'Children Ministry', href: '/r-kids-church', img: '/communities/r-kids.jpeg' },
              { name: 'The Bridge', sub: 'Youth Church', href: '/the-bridge', img: '/communities/the-bridge.jpg' },
              { name: 'R-Warriors', sub: "Men's Ministry", href: '/r-warriors', img: '/communities/r-warriors.jpg' },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group relative aspect-[3/4] rounded-2xl overflow-hidden block">
                <img
                  src={c.img}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-90"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(18,21,28,0.85)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <p className="text-white font-black text-sm leading-tight mb-0.5" style={H}>{c.name}</p>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2">{c.sub}</p>
                    <span className="inline-flex items-center gap-1 text-[#BF0A30] group-hover:text-red-300 text-[10px] font-bold transition-colors" style={H}>
                      Learn More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/r-communities"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all"
              style={H}
            >
              All Communities <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* QUOTE BLOCK */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl text-[#111827] mb-5 leading-tight" style={H}>
                There is a place<br />for everyone.
              </h3>
              <p className="text-[#6B7280] leading-relaxed mb-8">
                Join a community today to begin making a difference and find your purpose while serving others. We can all play a part in what God is doing, no matter our age or background.
              </p>
              <Link
                href="/r-communities"
                className="inline-flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all"
                style={H}
              >
                Join a Community <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div
              className="rounded-2xl p-10"
              style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-6xl text-[#BF0A30] leading-none mb-4" style={H}>&ldquo;</p>
              <p className="text-white text-2xl leading-snug" style={{ ...H, fontStyle: 'italic' }}>
                We believe the greatest leadership is service to others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
                Common Questions
              </p>
              <h2 className="text-4xl text-white mb-3 leading-tight" style={H}>FAQs</h2>
              <p className="text-[#8B95A8] text-sm">These are frequently asked questions about Ruach Tabernacle.</p>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {FAQS.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl text-white mb-4" style={H}>
            Attend an event.
          </h2>
          <p className="text-red-100 mb-8 leading-relaxed">
            Check out some of our upcoming events on the calendar.
          </p>
          <Link
            href="/r-events"
            className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
            style={H}
          >
            Events Calendar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </Layout>
  );
}
