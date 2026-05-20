import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const BELIEFS = [
  {
    title: 'The Gospel',
    text: 'We believe that Jesus is the Messiah, the Son of the Living God — that He was crucified for our sins and raised from the dead. This is the foundation of everything we are.',
    ref: 'Matthew 16:16 · 1 Corinthians 15:1-8',
  },
  {
    title: 'Salvation',
    text: 'We believe in the fall and sinfulness of man and that the only means of being cleansed from sin is through repentance and faith in the redeeming blood of Christ.',
    ref: '',
  },
  {
    title: 'New Birth',
    text: 'We believe that all who believe the Gospel are born again by the Holy Spirit and become children of God and heirs of eternal life.',
    ref: '',
  },
];

const VALUES = [
  { title: 'Presence', desc: 'We pursue the presence of God through individual and communal spiritual practices.' },
  { title: 'City', desc: 'We pursue the spiritual, social, and cultural flourishing of Nairobi and beyond.' },
  { title: 'Unity', desc: 'We pursue unity across racial, political, generational, and economic divides.' },
];

function BeliefCard({ title, text, ref: reference }: { title: string; text: string; ref: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-bold text-white text-sm" style={H}>{title}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-white/[0.03]">
          <p className="text-[#8B95A8] text-sm leading-relaxed">{text}</p>
          {reference && <p className="text-[#BF0A30] text-xs mt-3 font-medium">{reference}</p>}
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <Layout
      title="Who We Are — Ruach Tabernacle"
      description="Ruach Tabernacle Assembly — A community of believers passionate about Jesus Christ, rooted in the Word of God, and empowered by the Holy Spirit. Nairobi, Kenya."
    >

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'url(/church-photos/dark-backround.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <img
            src="/church-photos/advancing-kingdom.jpg"
            alt="Ruach Tabernacle"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span className="text-[120px] md:text-[180px] italic text-white/4 whitespace-nowrap leading-none select-none" style={H}>
            You&apos;re Family. &nbsp; You&apos;re Family.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Who We Are</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight tracking-tight mb-5" style={H}>
            You&apos;re<br /><span style={serif}>Family.</span>
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-md leading-relaxed">
            A community of believers passionate about Jesus Christ, rooted in the Word of God, and empowered by the Holy Spirit.
          </p>
        </div>
      </section>

      {/* ── AFFIRMATION ───────────────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-3xl mx-auto px-8 lg:px-16 text-center">
          <div
            className="rounded-3xl px-10 py-12"
            style={{ background: 'rgba(191,10,48,0.08)', border: '1px solid rgba(191,10,48,0.15)' }}
          >
            <p className="text-[#111827] text-lg md:text-xl font-bold leading-relaxed" style={serif}>
              &ldquo;I am a winner and not a loser.<br />
              I am a victor and not a victim.<br />
              I have changed my mind and my attitude to reflect what God says about me.<br />
              My faith is built on God&apos;s Word.<br />
              Nothing is impossible from this moment on.&rdquo;
            </p>
            <p className="text-[#BF0A30] mt-6 font-bold text-xs uppercase tracking-widest" style={H}>
              Ruach Tabernacle Confession
            </p>
          </div>
        </div>
      </section>

      {/* ── MISSION ───────────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Our Mission</p>
              <h2 className="text-4xl md:text-5xl text-white leading-tight mb-6" style={H}>
                To Raise<br /><span style={serif}>Kingdom Champions</span>
              </h2>
              <p className="text-[#8B95A8] text-base leading-relaxed mb-5">
                Our mission is to effectively administer the Word of God and spread it through innovative channels —
                taking care of people&apos;s welfare and glorifying God through excellence.
              </p>
              <p className="text-[#8B95A8] text-sm leading-relaxed mb-8">
                We are raising an empowered body of Christ that fulfills her Kingdom mandate while reflecting
                God&apos;s glory to the nations.
              </p>
              <Link
                href="/r-connect"
                className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all shadow-xl shadow-[rgba(191,10,48,0.35)]"
                style={H}
              >
                Join Connect Class <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-[#12151C] border border-white/5 rounded-2xl p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(191,10,48,0.15)] border border-[rgba(191,10,48,0.2)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#BF0A30] text-xs font-black" style={H}>{v.title[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm mb-1" style={H}>{v.title}</h3>
                    <p className="text-[#8B95A8] text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE BELIEVE ───────────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Our Faith</p>
            <h2 className="text-4xl md:text-5xl text-[#111827] leading-tight" style={H}>
              What We<br /><span style={serif}>Believe</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {BELIEFS.map((b) => (
              <div key={b.title} className="bg-[#000000] rounded-2xl p-8">
                <div className="w-10 h-10 rounded-xl bg-[rgba(191,10,48,0.2)] flex items-center justify-center mb-5">
                  <span className="text-[#BF0A30] font-black text-sm" style={H}>{b.title[0]}</span>
                </div>
                <h3 className="text-white font-black text-lg mb-3" style={H}>{b.title}</h3>
                <p className="text-[#8B95A8] leading-relaxed text-sm mb-3">{b.text}</p>
                {b.ref && <p className="text-[#BF0A30] text-xs font-medium">{b.ref}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BELIEFS ACCORDION ─────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-3xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>In Detail</p>
          <h2 className="text-3xl md:text-4xl text-white mb-10" style={H}>Our Core Beliefs</h2>
          <div className="space-y-3">
            {BELIEFS.map((b) => (
              <BeliefCard key={b.title} title={b.title} text={b.text} ref={b.ref} />
            ))}
          </div>
        </div>
      </section>

      {/* ── RT KIDS ───────────────────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="bg-[#000000] rounded-3xl overflow-hidden grid md:grid-cols-2">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>For Families</p>
              <h2 className="text-3xl md:text-4xl text-white mb-4 leading-tight" style={H}>
                What about<br /><span style={serif}>my kids?</span>
              </h2>
              <p className="text-[#8B95A8] leading-relaxed text-sm mb-4">
                We know that your children are a big priority. RT Kids creates a safe, fun, and engaging environment through games, interactive Bible lessons, and creative crafts.
              </p>
              <p className="text-[#8B95A8] text-sm leading-relaxed mb-8">
                All our volunteers undergo background checks and receive comprehensive training in child safety and protection.
              </p>
              <Link
                href="/r-kids-church"
                className="self-start flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all"
                style={H}
              >
                R-Kids Church <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative min-h-[280px] md:min-h-0">
              <img
                src="/kids/children-1.jpeg"
                alt="R-Kids Church"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#000]/60 via-transparent to-transparent md:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Every Sunday · 3 Services</p>
          <h2 className="text-4xl md:text-5xl text-white mb-5 leading-tight" style={H}>
            Come as<br /><span style={serif}>You Are.</span>
          </h2>
          <p className="text-red-100 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            We welcome you. Whether you prefer to dress up or dress down — your seat is ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/new-here"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>

      <ExpectGallery />

    </Layout>
  );
}
