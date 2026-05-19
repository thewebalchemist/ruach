import Link from 'next/link';
import { useState, useRef } from 'react';
import { ArrowRight, ChevronDown, Play, Volume2, VolumeX, CalendarDays } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';
import { supabase } from '@/lib/supabase';
import type { GetStaticProps } from 'next';

interface Sermon   { id: string; title: string; slug: string; preacher: string; service_date: string; }
interface PageProps { latestSermon: Sermon | null; isLive: boolean; }

// Font styles
const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const FAQS = [
  { q: 'What are your services like?', a: 'We provide an inviting atmosphere where everyone is welcome. Our services are a little over an hour long — filled with powerful worship, practical teachings that will help grow your faith in God, and a community of people that want to do life with you.' },
  { q: 'What should I wear?', a: 'We welcome you to come as you are. Whether you prefer to dress up or dress down, we encourage you to wear modestly and decently. Come comfortable.' },
  { q: 'How is it like visiting for the first time?', a: "We are committed to making sure that your first visit is enjoyable and stress-free. We won't single you out, make you stand up, or pressure you for money. Explore at your own pace." },
  { q: 'What about my kids?', a: "We know that your children are a big priority. We aim to create a safe, fun, and engaging environment through RT Kids — with games, interactive Bible lessons, and creative crafts. All volunteers are thoroughly vetted." },
  { q: 'How can I get connected?', a: 'Getting connected is easy! Attend our Connect Class to learn everything about Ruach, or join a Crosspoint (home church) where you can connect with people in your zone and grow in your faith.' },
];

const COMMUNITIES = [
  { name: 'R-Kids Church',  sub: 'Children Ministry',  href: '/r-kids-church',    img: '/kids/children-1.jpeg' },
  { name: 'The Bridge',     sub: 'Youth Church',        href: '/the-bridge',       img: '/church-photos/aug-2025-c.jpg' },
  { name: 'Kingdom Woman',  sub: 'Women Ministry',      href: '/kingdom-woman',    img: '/church-photos/worship-ruach.jpg' },
  { name: 'R-Warriors',     sub: 'Men Ministry',        href: '/r-warriors',       img: '/church-photos/ruach1.jpg' },
];

const GALLERY = [
  '/church-photos/rhema-feast.jpg',
  '/church-photos/june-2025.jpg',
  '/church-photos/aug-2025-a.jpg',
  '/church-photos/aug-2025-b.jpg',
  '/church-photos/advancing-kingdom.jpg',
  '/church-photos/dec-2024.jpg',
  '/church-photos/aug-2025-c.jpg',
  '/church-photos/instagram.jpg',
  '/church-photos/IMG_7023.jpg',
  '/church-photos/IMG_1716.jpg',
  '/church-photos/about-carousel.avif',
  '/church-photos/ruach-1.png',
];

// Repeating marquee text (duplicated so animation is seamless)
const MARQUEE_FAMILY = Array.from({ length: 8 }, () => "You're Family.").join(' ');

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
        <div className="px-6 pb-6 pt-2 text-[#8B95A8] text-sm leading-relaxed bg-white/3">{a}</div>
      )}
    </div>
  );
}

export default function HomePage({ latestSermon, isLive }: PageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <Layout
      title="God · Work · Community"
      description="Ruach Tabernacle Assembly — A God-focused, Service-oriented, Community-driven church in Nairobi, Kenya. Join us every Sunday at 8AM, 10AM or 12:30PM along the Northern Bypass next to Shell Windsor."
    >

      {/* ══════════════════════════════════════════════
          HERO — Video background + Spirit animations
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-[#0A0C10]">

        {/* Dark texture background (visible before video loads) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/church-photos/dark-backround.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Video background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-55"
          autoPlay muted loop playsInline preload="auto"
          poster="/church-photos/IMG_1716.jpg"
        >
          <source src="/videos/welcome-to-ruach.mp4" type="video/mp4" />
        </video>

        {/* ═══ BREATH OF GOD — Spirit of Ruach (רוח) ═══
            Ruach = the breath and wind of the Holy Spirit.
            These slow, living orbs evoke the Spirit that hovered
            over the waters — always moving, always filling.
        ══════════════════════════════════════════════════ */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Orb 1 — primary breath, centre-left */}
          <div
            className="spirit-orb spirit-breathe w-[600px] h-[600px] bg-[#BF0A30]"
            style={{
              top: '15%', left: '5%',
              filter: 'blur(120px)',
              opacity: 0.18,
              ['--spirit-dur' as string]: '8s',
            }}
          />
          {/* Orb 2 — drifting wind, upper-right */}
          <div
            className="spirit-orb spirit-drift w-[400px] h-[400px] bg-white"
            style={{
              top: '8%', right: '10%',
              filter: 'blur(90px)',
              opacity: 0.07,
              ['--spirit-dur' as string]: '13s',
              animationDelay: '2s',
            }}
          />
          {/* Orb 3 — deep breath, lower centre */}
          <div
            className="spirit-orb spirit-pulse w-[500px] h-[500px] bg-[#BF0A30]"
            style={{
              bottom: '10%', left: '35%',
              filter: 'blur(140px)',
              opacity: 0.12,
              ['--spirit-dur' as string]: '10s',
              animationDelay: '3.5s',
            }}
          />
          {/* Orb 4 — subtle wind sweep, far left */}
          <div
            className="spirit-orb spirit-wind w-[300px] h-[200px] bg-[#9A0826]"
            style={{
              top: '50%', left: '-5%',
              filter: 'blur(70px)',
              opacity: 0.20,
              ['--spirit-dur' as string]: '11s',
              animationDelay: '1s',
            }}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />

        {/* Mute / Unmute button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2 apple-glass-dark text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-all hover:scale-105"
          style={H}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {muted ? 'Unmute' : 'Mute'}
        </button>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16 pb-28 pt-32 w-full">
          {/* Theme badge */}
          <div className="inline-flex items-center gap-2 apple-glass-brand text-[#F87171] text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 mb-10" style={H}>
            2026 Theme: Greater Glory
          </div>

          {/* Mixed typography headline — Montserrat + Playfair Display italic */}
          <h1 className="text-white leading-[0.95] tracking-tight mb-10">
            <span className="block text-6xl md:text-7xl lg:text-[96px]" style={H}>Raising</span>
            <span className="block text-6xl md:text-7xl lg:text-[96px]" style={{ ...serif, fontWeight: 900, fontSize: undefined }}>
              <span className="text-6xl md:text-7xl lg:text-[96px]" style={serif}>Kingdom</span>
            </span>
            <span className="block text-6xl md:text-7xl lg:text-[96px] text-[#BF0A30]" style={H}>Champions</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-white/70 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
            A church for people who want to live out their God-given purpose —<br className="hidden md:block" />
            <span style={serif}> in business, family, and beyond.</span>
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap gap-3">
            <Link href="/new-here"
              className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-[rgba(191,10,48,0.4)]"
              style={H}
            >
              Plan a Visit
            </Link>
            <Link href="/who-we-are"
              className="flex items-center gap-2 apple-glass-dark text-white font-bold text-sm uppercase tracking-wider px-7 py-4 transition-all hover:-translate-y-0.5"
              style={H}
            >
              Our Story
            </Link>
            {isLive && (
              <Link href="/live"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl transition-all"
                style={H}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Live Now
              </Link>
            )}
          </div>

          {/* Watch reel button */}
          <button
            className="mt-8 flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="w-12 h-12 rounded-full apple-glass-dark flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </span>
            <span className="text-sm font-medium">See what we&apos;re about</span>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HERO MARQUEE — God · Work · Community
      ══════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_25s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`ha${i}`} className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight" style={H}>
                <span className="text-[#BF0A30]" style={serif}>God</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">Work</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Community</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_25s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`hb${i}`} className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight" style={H}>
                <span className="text-[#BF0A30]" style={serif}>God</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">Work</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Community</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INFO CARDS — Masonry bento grid
      ══════════════════════════════════════════════ */}
      <section id="services" className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <h2 className="text-4xl md:text-5xl text-[#111827] leading-[1.1]" style={H}>
              We can&apos;t wait to<br />
              <span style={{ ...serif, fontWeight: 700 }}>meet you.</span>
            </h2>
            <Link href="/new-here"
              className="self-start sm:self-auto flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all"
              style={H}
            >
              New Here? →
            </Link>
          </div>

          {/* Masonry bento — 3 cols, 2 rows */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ gridTemplateRows: 'repeat(2, auto)' }}
          >

            {/* ── SERVICE TIMES — wide dark card (col-span-2) */}
            <div className="md:col-span-2 rounded-3xl bg-[#000000] p-8 flex flex-col min-h-[260px]">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-8" style={H}>Every Sunday</p>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                {[
                  { n: 'First Service',  t: '8:00',  suf: 'AM'    },
                  { n: 'Second Service', t: '10:00', suf: '– Noon' },
                  { n: 'Third Service',  t: '12:30', suf: 'PM'    },
                ].map((s, i) => (
                  <div key={s.n} className={i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-6' : ''}>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2" style={H}>{s.n}</p>
                    <p className="text-white leading-none flex items-baseline gap-1.5" style={H}>
                      <span className="text-4xl lg:text-[52px]">{s.t}</span>
                      <span className="text-sm text-white/50" style={serif}>{s.suf}</span>
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-[10px] uppercase tracking-wider mt-8" style={H}>
                Northern Bypass, next to Shell Windsor · Nairobi
              </p>
            </div>

            {/* ── R-KIDS — tall photo card (row-span-2) */}
            <div className="md:row-span-2 rounded-3xl overflow-hidden relative min-h-[340px]">
              <img
                src="/kids/children-1.jpeg"
                alt="R-Kids Church"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-7 flex flex-col justify-end">
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-2" style={H}>R-Kids Church</p>
                <h3 className="text-white text-2xl font-black leading-tight mb-3" style={H}>
                  What about<br /><span style={serif}>my kids?</span>
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-5">
                  Safe, fun, and engaging — your children are in the best hands.
                </p>
                <Link href="/r-kids-church"
                  className="self-start flex items-center gap-2 bg-white text-[#111827] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl hover:bg-white/90 transition-colors"
                  style={H}
                >
                  R-Kids Church <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* ── LOCATION — pure black */}
            <div className="rounded-3xl bg-[#000000] p-7 flex flex-col min-h-[220px]">
              <p className="text-[#8B95A8] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Our Location</p>
              <p className="text-white text-xl font-black leading-snug flex-1" style={H}>
                Rhema Grounds, Rhema Ave<br />
                Off Northern Bypass · next to<br />
                <span className="text-[#BF0A30]">Shell Windsor,</span>{' '}Nairobi
              </p>
              <a
                href="https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x182f3df45daed397:0xf4b86ad49e78ca05!2m2!1d36.8476721!2d-1.2147391?entry=ttu&g_ep=EgoyMDI1MTAyOC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-between border border-[#BF0A30] text-[#BF0A30] hover:bg-[#BF0A30] hover:text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl transition-all"
                style={H}
              >
                See Directions <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* ── SERMONS — deep dark */}
            <div className="rounded-3xl bg-[#000000] p-7 flex flex-col min-h-[220px]">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Watch Sermons</p>
              <p
                className="text-white/70 text-sm leading-relaxed flex-1"
                style={latestSermon ? { ...serif, fontStyle: 'italic' as const } : {}}
              >
                {latestSermon
                  ? <>&ldquo;{latestSermon.title}&rdquo;</>
                  : <>Transformative messages — watch anytime, anywhere.</>}
              </p>
              <Link href="/sermons"
                className="mt-5 flex items-center justify-between bg-[#BF0A30] text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors"
                style={H}
              >
                Latest Sermon <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TWO CTA CARDS — Glassmorphism
      ══════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/rhema-feast.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.2)' }}
          />
          <div className="absolute inset-0 bg-[#0A0C10]/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 grid md:grid-cols-2 gap-6">
          {/* We're people like you */}
          <div className="rounded-3xl p-10" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={H}>New Here?</p>
            <h3 className="text-white text-3xl md:text-4xl mb-4 leading-tight" style={H}>
              We&apos;re People<br /><span style={serif}>Just Like You.</span>
            </h3>
            <p className="text-[#8B95A8] text-sm leading-relaxed mb-8">We are a community of believers passionate about Jesus Christ, rooted in the Word of God, and empowered by the Holy Spirit.</p>
            <Link href="/new-here" className="inline-flex items-center gap-2 bg-white text-[#111827] hover:bg-gray-100 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all" style={H}>Plan a Visit <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>

          {/* Connect to purpose */}
          <div className="bg-[#BF0A30] rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full" />
            <p className="relative text-red-200 text-xs font-bold uppercase tracking-widest mb-3" style={H}>Get Involved</p>
            <h3 className="relative text-white text-3xl md:text-4xl mb-4 leading-tight" style={H}>
              Connect to Your<br /><span style={serif}>Life&apos;s Purpose.</span>
            </h3>
            <p className="relative text-red-100 text-sm leading-relaxed mb-8">God wants to use you to make an impact in the world. You have unique gifts and talents that can transform our community.</p>
            <Link href="/r-connect" className="relative inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all" style={H}>Be Connected <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          MARQUEE — "You're Family." — outlined stroke style
      ══════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-6 overflow-hidden border-y border-[#E0D8CE]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={`a${i}`} className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap" style={{ ...H, fontStyle: 'italic' }}>
                You&apos;re Family.
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={`b${i}`} className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap" style={{ ...H, fontStyle: 'italic' }}>
                You&apos;re Family.
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          COMMUNITIES — "There is a place for Everybody"
      ════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <h2 className="text-4xl md:text-5xl text-[#111827] leading-[1.05]" style={H}>
              There is a place here<br />
              <span style={serif}>for Everybody.</span>
            </h2>
            <Link href="/r-communities" className="self-start sm:self-auto flex items-center gap-1.5 border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all" style={H}>
              All Communities →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMUNITIES.map((c) => (
              <Link key={c.href} href={c.href} className="group relative rounded-2xl overflow-hidden block" style={{ aspectRatio: '3/4' }}>
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div
                    className="rounded-2xl p-3"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <p className="text-white font-black text-sm leading-tight" style={H}>{c.name}</p>
                    <p className="text-white/60 text-[10px] uppercase tracking-wider mt-0.5">{c.sub}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-white/70 text-[10px] font-bold" style={H}>
                      Learn More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
    IMPACT — Stats + Rhema Feast
══════════════════════════════ */}
      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3 text-center" style={H}>Our Impact</p>
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12" style={H}>God Is Moving at Ruach</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { number: '10,000+', label: 'At Rhema Feast 2025' },
              { number: '3,000+',  label: 'Weekly Congregation' },
              { number: '5',       label: 'Nairobi Assemblies' },
              { number: '18+',     label: 'Years of Ministry' },
            ].map((s) => (
              <div key={s.label} className="text-center p-6 rounded-2xl bg-[#12151C] border border-white/5">
                <p className="text-4xl font-black text-[#BF0A30] mb-1" style={H}>{s.number}</p>
                <p className="text-[#8B95A8] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '21/9' }}>
            <img
              src="/church-photos/rhema-feast.jpg"
              alt="Rhema Feast 2025 — Uhuru Park"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/40 to-transparent" />
            <div className="absolute bottom-6 left-8">
              <p className="text-white font-black text-2xl" style={H}>Rhema Feast 2025</p>
              <p className="text-[#8B95A8] text-sm mt-1">10th Edition · Uhuru Park, Nairobi</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════
          STORY SECTION — YouVersion-inspired
          Life-changing stories block
      ═════════════════════════════════════ */}
      <section
        className="relative py-20"
        style={{
          backgroundImage: 'url(/church-photos/dark-background-2.png)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0A0C10]/85" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#8B95A8] text-xs uppercase tracking-widest font-medium mb-2" style={H}>Life-Changing Stories —</p>
              <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
                Faith in <span style={{ ...serif, color: '#BF0A30' }}>Real Life</span>
              </h2>
            </div>
            <p className="text-[#8B95A8] max-w-xs text-sm leading-relaxed">Real people share how Ruach Tabernacle is transforming their lives, one encounter with God at a time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: 'TRANSFORMED', text: '"I walked in broken. I left knowing God had a plan for my life."', name: 'Amara · Nairobi', img: '/church-photos/aug-2025-a.jpg' },
              { label: 'CONNECTED', text: '"I found my people in the Crosspoints group. Life finally made sense."', name: 'Brian · Westlands', img: '/church-photos/advancing-kingdom.jpg' },
              { label: 'PURPOSED', text: '"Ruach showed me my career and my faith don\'t have to be separate."', name: 'Cynthia · Karen', img: '/church-photos/june-2025.jpg' },
            ].map((story) => (
              <div key={story.label} className="group relative aspect-[3/4] rounded-3xl overflow-hidden">
                <img src={story.img} alt={story.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[#BF0A30] text-xs font-black uppercase tracking-widest mb-3" style={H}>{story.label}</p>
                  <p className="text-white text-lg font-bold leading-snug mb-3" style={{ ...serif, fontWeight: 700 }}>{story.text}</p>
                  <p className="text-white/50 text-xs font-medium">{story.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          UPCOMING EVENT — 7 Days of Glory
      ════════════════════════════════ */}
      <section className="bg-[#000] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-center gap-3 mb-10">
            <CalendarDays className="w-4 h-4 text-[#BF0A30]" />
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest" style={H}>Upcoming Event</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Event image */}
            <div className="rounded-2xl overflow-hidden aspect-[16/9]">
              <img
                src="/events/7-days-of-glory.jpg"
                alt="7 Days of Glory"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }}
              />
            </div>
            {/* Event details */}
            <div>
              <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>25th – 31st May 2026</p>
              <h2 className="text-4xl md:text-5xl text-white leading-tight mb-6" style={H}>
                7 Days of<br /><span style={serif}>Glory</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                There are moments that shift seasons, ignite hearts, and leave lives forever changed.
                This is one of them. Seven evenings of worship, prayer, revival, and divine encounters.
                Come expectant for fresh fire, fresh grace, and a fresh touch from God.
              </p>
              {/* Meta info */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: '🗓', text: '25th May – 31st May 2026' },
                  { icon: '⏰', text: '5:00PM – 8:00PM' },
                  { icon: '📍', text: 'Rhema Grounds, Northern Bypass — next to Shell Windsor, Nairobi' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-sm italic mb-8" style={serif}>
                Seven nights. Countless testimonies. One God.
              </p>
              <Link
                href="/new-here"
                className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-sm uppercase tracking-widest px-7 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-[rgba(191,10,48,0.4)]"
                style={H}
              >
                Register Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          LATEST SERMON — YouTube embed
      ════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={H}>Latest Sermon</p>
              <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
                Watch the<br /><span style={serif}>Latest Message</span>
              </h2>
            </div>
            <Link href="/sermons" className="self-start border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all" style={H}>
              All Sermons →
            </Link>
          </div>
          {/* YouTube embed — responsive */}
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', maxWidth: '860px' }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/nznXwkJlJ44?si=tngN68AvAVS69CZn"
              title="Latest Sermon — Ruach Tabernacle"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          GALLERY — Shared ExpectGallery component
      ════════════════════════════════════════ */}
      <ExpectGallery />

      {/* ════════════════════
          FAQ — Dark, styled
      ════════════════════ */}
      <section
        className="relative py-20"
        style={{
          backgroundImage: 'url(/church-photos/dark-background-3.png)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0A0C10]/88" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-3 gap-16">
            <div>
              <h2 className="text-4xl text-white mb-4" style={H}>FAQs</h2>
              <p className="text-[#8B95A8] text-sm leading-relaxed">These are frequently asked questions about Ruach Tabernacle.</p>
              <Link href="/all-about-ruach" className="mt-6 inline-flex items-center gap-1.5 text-[#BF0A30] text-xs font-bold uppercase tracking-wider" style={H}>
                All About Ruach <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [{ data: sermon }, { data: stream }] = await Promise.all([
      supabase.from('sermons').select('id,title,slug,preacher,service_date').order('service_date', { ascending: false }).limit(1).single(),
      supabase.from('stream_settings').select('is_live').limit(1).single(),
    ]);
    return { props: { latestSermon: sermon ?? null, isLive: stream?.is_live ?? false }, revalidate: 60 };
  } catch {
    return { props: { latestSermon: null, isLive: false }, revalidate: 60 };
  }
};
