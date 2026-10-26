import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ChevronDown, CalendarDays, MapPin } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';
import { Reveal, RiseLine, CountUp, Parallax } from '@/components/shared/Reveal';
import ThemeHero from '@/components/streaming/ThemeHero';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { GetStaticProps } from 'next';
import { sundayServiceEvents, eventJsonLd, OG } from '@/lib/seo';
import BreathHero from './BreathHero';
import WindLine, { WindField } from './WindLine';
import { useScrollVar } from './useScrollVar';
import s from './home.module.css';

interface HomeSermon { id: string; title: string; slug: string; preacher: string; service_date: string; youtube_url: string; thumbnail_url: string | null; description: string | null; }
interface UpcomingEvent { id: string; title: string; description: string | null; event_date: string; end_date: string | null; start_time: string | null; location: string | null; map_url: string | null; image_url: string | null; }
interface PageProps { recentSermons: HomeSermon[]; isLive: boolean; upcomingEvents: UpcomingEvent[]; }

// Font styles
// Headline voice: Bricolage Grotesque; accent voice: Fraunces (upright serif)
const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

const FAQS = [
  { q: 'What are your services like?', a: 'We provide an inviting atmosphere where everyone is welcome. Our services are a little over an hour long — filled with powerful worship, practical teachings that will help grow your faith in God, and a community of people that want to do life with you.' },
  { q: 'What should I wear?', a: 'We welcome you to come as you are. Whether you prefer to dress up or dress down, we encourage you to wear modestly and decently. Come comfortable.' },
  { q: 'What is it like visiting for the first time?', a: "We are committed to making sure that your first visit is enjoyable and stress-free. We won't single you out, make you stand up, or pressure you for money. Explore at your own pace." },
  { q: 'What about my kids?', a: "We know that your children are a big priority. We aim to create a safe, fun, and engaging environment through RT Kids — with games, interactive Bible lessons, and creative crafts. All volunteers are thoroughly vetted." },
  { q: 'How can I get connected?', a: 'Getting connected is easy! Attend our Connect Class to learn everything about Ruach, or join a Crosspoint (home church) where you can connect with people in your zone and grow in your faith.' },
];

const COMMUNITIES = [
  { name: 'R-Kids Church',  sub: 'Children Ministry',  href: '/r-kids-church',    img: '/communities/r-kids.jpeg' },
  { name: 'The Bridge',     sub: 'Youth Church',        href: '/the-bridge',       img: '/communities/the-bridge1.jpg' },
  { name: 'Kingdom Woman',  sub: "Women's Ministry",    href: '/kingdom-woman',    img: '/communities/kingdom-woman.jpg' },
  { name: 'R-Warriors',     sub: "Men's Ministry",      href: '/r-warriors',       img: '/communities/r-warriors.jpg' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-bold text-white text-sm" style={H}>{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`expand-grid ${open ? 'is-open' : ''}`}>
        <div>
          <div className="px-6 pb-6 pt-2 text-[#8B95A8] text-sm leading-relaxed bg-white/3">{a}</div>
        </div>
      </div>
    </div>
  );
}

const MAPS_DIR = 'https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x182f3df45daed397:0xf4b86ad49e78ca05!2m2!1d36.8476721!2d-1.2147391?entry=ttu&g_ep=EgoyMDI1MTAyOC4wIKXMDSoASAFQAw%3D%3D';

const SERVICES = [
  { n: 'First Service',  t: '8:00',  suf: 'AM', at: '300ms'  },
  { n: 'Second Service', t: '10:00', suf: 'AM', at: '1300ms' },
  { n: 'Third Service',  t: '12:30', suf: 'PM', at: '2400ms' },
];

const PILLARS = [
  {
    label: 'Worship',
    title: 'An encounter with God',
    body: 'Our worship is alive — Spirit-filled music that ushers you into God\'s presence. Come ready to experience something real.',
    img: '/church-photos/worship-ruach.jpg',
    alt: 'A woman in a white coat worshipping with her hands raised',
  },
  {
    label: 'The Word',
    title: 'Practical, powerful teaching',
    body: 'Every message is rooted in Scripture and designed to equip you for real life — in your home, your business, and your community.',
    img: '/church-photos/aug-2025-a.jpg',
    alt: 'A preacher on stage in front of the congregation',
  },
  {
    label: 'Community',
    title: 'People doing life together',
    body: 'You were never meant to do life alone. At Ruach, you\'ll find your people — in Crosspoints, communities, and Sunday services.',
    img: '/church-photos/IMG_1716.jpg',
    alt: 'A group of church members smiling together at an evening event',
  },
];

const STATS = [
  { number: '100,000+', label: 'Attended Rhema Feast 2025', sub: 'Uhuru Park, Nairobi' },
  { number: '3,000+',  label: 'Weekly Congregation',        sub: 'Across 3 Sunday services' },
  { number: '5',       label: 'Nairobi Assemblies',          sub: 'And still planting' },
  { number: '18+',     label: 'Years of Ministry',           sub: 'Since 2007' },
];

const RHEMA = [
  { src: '/rhema-feast/rhema-feast1.jpg',            alt: 'Rhema Feast 2025' },
  { src: '/rhema-feast/rhema-feast2.jpg',            alt: 'Rhema Feast 2025 Worship' },
  { src: '/rhema-feast/Rhema-Feast-1-og_image.webp', alt: 'Rhema Feast 2025 Crowd' },
];

function GodWorkCommunity() {
  return (
    <span className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight pr-12" style={H}>
      <span className="text-[#BF0A30]" style={serif}>God</span>
      <span className="text-white/20 text-lg">·</span>
      <span className="text-white/80">Work</span>
      <span className="text-white/20 text-lg">·</span>
      <span className="text-[#BF0A30]" style={serif}>Community</span>
      <span className="text-white/10 text-lg">—</span>
    </span>
  );
}

export default function HomePage({ recentSermons, isLive, upcomingEvents = [] }: PageProps) {
  const familyRef = useScrollVar<HTMLElement>(2.2);
  const stripRef = useScrollVar<HTMLDivElement>(1);

  return (
    <Layout
      title="Ruach Tabernacle Assembly | Church in Nairobi, Northern Bypass"
      description="A God-focused, Service-oriented, Community-driven church in Nairobi. Sunday services at 8AM, 10AM and 12:30PM on the Northern Bypass, next to Shell Windsor."
      image={OG.default}
      imageAlt="The congregation inside the tent at Rhema Grounds, Nairobi"
      structuredData={[...sundayServiceEvents(), ...upcomingEvents.map(ev => eventJsonLd(ev))]}
    >

      {/* ══ HERO: the breath ══════════════════════════════════════ */}
      <BreathHero>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full ${s.heroCopy}`}>
          <h1 className="text-white leading-[0.92] tracking-[-0.03em] mb-6 sm:mb-8">
            <RiseLine index={0} className="text-[52px] sm:text-7xl lg:text-[104px]" style={H}>Raising</RiseLine>
            <RiseLine index={1} className="text-[52px] sm:text-7xl lg:text-[104px]" style={serif}>Kingdom</RiseLine>
            <RiseLine index={2} className="text-[52px] sm:text-7xl lg:text-[104px] text-[#BF0A30]" style={H}>Champions</RiseLine>
          </h1>

          <p className={`text-white/75 text-base sm:text-lg md:text-xl max-w-lg mb-8 leading-relaxed ${s.fadeUp}`} style={{ ['--d' as string]: '420ms' }}>
            A church for people who want to live out their God-given purpose —
            <span style={serif}> in business, family, and beyond.</span>
          </p>

          <div className={`flex flex-wrap gap-3 ${s.fadeUp}`} style={{ ['--d' as string]: '620ms' }}>
            <Link href="/new-here"
              className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-wider px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-[0_12px_32px_-8px_rgba(191,10,48,0.6)]"
              style={H}
            >
              Plan a Visit
            </Link>
            <Link href="/who-we-are"
              className="flex items-center gap-2 border border-white/30 hover:border-white/60 bg-black/30 text-white font-bold text-sm uppercase tracking-wider px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl transition-all hover:-translate-y-0.5"
              style={H}
            >
              Our Story
            </Link>
            {isLive && (
              <Link href="/live"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl transition-all"
                style={H}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Live Now
              </Link>
            )}
          </div>
        </div>
      </BreathHero>

      {/* ══ God · Work · Community ═════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5" aria-label="God, Work, Community">
        <div className="flex w-max animate-[marquee_28s_linear_infinite]" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => <GodWorkCommunity key={i} />)}
        </div>
      </section>

      {/* ══ We can't wait to meet you ══════════════════════════════ */}
      <section id="services" className="bg-[#F5F0E8] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Reveal variant="none" className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-[34px] sm:text-[40px] md:text-6xl text-[#111827] leading-[1.02] tracking-[-0.02em]" style={H}>
                <RiseLine index={0}>We can&apos;t wait to</RiseLine>
                <RiseLine index={1} style={{ ...serif, fontWeight: 700 }}>meet you.</RiseLine>
              </h2>
              <WindLine className="mt-4" width={180} />
            </div>
            <RiseLine index={2} className="self-start sm:self-auto">
              <Link href="/new-here"
                className="inline-flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all"
                style={H}
              >
                New Here? →
              </Link>
            </RiseLine>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Every Sunday: the day drawn as one line, the services lighting up in turn */}
            <Reveal variant="up" className="md:col-span-2 rounded-[28px] bg-[#000] p-7 sm:p-9 flex flex-col min-h-[300px] relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-2/5 md:w-1/3 pointer-events-none">
                <img src="/church-photos/worship-ruach.jpg" alt="" aria-hidden className="w-full h-full object-cover opacity-35" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#000] via-[#000]/60 to-transparent" />
              </div>
              <p className="relative text-[#BF0A30] text-[11px] font-bold uppercase tracking-widest mb-10" style={H}>Every Sunday</p>
              <div className={`relative flex-1 ${s.sunday}`}>
                <div className={s.track}><div className={s.trackFill} /></div>
                <ol className="relative grid grid-cols-1 sm:grid-cols-3 gap-7 sm:gap-6">
                  {SERVICES.map(sv => (
                    <li key={sv.n} className="flex sm:flex-col gap-5 sm:gap-6" style={{ ['--at' as string]: sv.at }}>
                      <span className={`${s.node} flex-shrink-0`} />
                      <div className={s.slot}>
                        <p className="text-white/45 text-[11px] uppercase tracking-widest mb-2" style={H}>{sv.n}</p>
                        <p className="text-white leading-none flex items-baseline gap-1.5" style={H}>
                          <span className="text-[44px] lg:text-[56px] tracking-[-0.02em] tabular-nums">{sv.t}</span>
                          <span className="text-base text-white/55" style={serif}>{sv.suf}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="relative text-white/40 text-[11px] uppercase tracking-wider mt-10" style={H}>
                Northern Bypass, next to Shell Windsor · Nairobi
              </p>
            </Reveal>

            {/* R-Kids */}
            <Reveal variant="up" delay={120} className="img-curtain md:row-span-2 rounded-[28px] overflow-hidden relative min-h-[380px]">
              <img
                src="/kids/children-1.jpeg"
                alt="R-Kids Church"
                className="img-curtain-img absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-7 flex flex-col justify-end">
                <p className="text-[#FF5A79] text-[11px] font-bold uppercase tracking-widest mb-2" style={H}>R-Kids Church</p>
                <h3 className="text-white text-[28px] font-black leading-tight mb-3" style={H}>
                  What about<br /><span style={serif}>my kids?</span>
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-5">
                  Safe, fun, and engaging — your children are in the best hands.
                </p>
                <Link href="/r-kids-church"
                  className="self-start flex items-center gap-2 bg-white text-[#111827] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl hover:bg-white/90 transition-colors"
                  style={H}
                >
                  R-Kids Church <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Reveal>

            {/* Location */}
            <Reveal variant="up" delay={200} className="rounded-[28px] bg-[#000] p-7 flex flex-col min-h-[230px]">
              <p className="text-[#8B95A8] text-[11px] font-bold uppercase tracking-widest mb-4" style={H}>Our Location</p>
              <p className="text-white text-base font-bold leading-relaxed flex-1" style={H}>
                Rhema Grounds, Rhema Ave<br />
                Off Northern Bypass · next to<br />
                <span className="text-[#FF5A79]">Shell Windsor,</span>{' '}Nairobi
              </p>
              <a
                href={MAPS_DIR}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-between border border-[#BF0A30] text-white hover:bg-[#BF0A30] font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl transition-all"
                style={H}
              >
                See Directions <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Reveal>

            {/* Sermons */}
            <Reveal variant="up" delay={280} className="rounded-[28px] bg-[#000] p-7 flex flex-col min-h-[230px]">
              <p className="text-[#FF5A79] text-[11px] font-bold uppercase tracking-widest mb-4" style={H}>Watch Sermons</p>
              <div className="flex-1">
                {recentSermons[0] && (
                  <p className="text-white/85 text-base leading-snug mb-2" style={{ ...serif }}>
                    &ldquo;{recentSermons[0].title.trim()}&rdquo;
                  </p>
                )}
                <p className="text-white/55 text-sm leading-relaxed">
                  Kingdom-focused messages that will transform your life.
                </p>
              </div>
              <Link href="/sermons"
                className="mt-5 flex items-center justify-between bg-[#BF0A30] text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors"
                style={H}
              >
                All Sermons <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ Two invitations ════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-[#0A0C10]">
        <div className="absolute inset-0">
          <Parallax speed={-0.12} className="absolute -inset-y-16 inset-x-0">
            <img src="/church-photos/rhema-feast.jpg" alt="" aria-hidden className="w-full h-full object-cover" style={{ filter: 'brightness(0.22)' }} loading="lazy" />
          </Parallax>
          <div className="absolute inset-0 bg-[#0A0C10]/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid md:grid-cols-2 gap-5">
          <Reveal variant="left" className="rounded-[28px] p-8 sm:p-10 bg-[#12151C] border border-white/10">
            <p className="text-[#FF5A79] text-xs font-bold uppercase tracking-widest mb-3" style={H}>New Here?</p>
            <h3 className="text-white text-3xl md:text-[40px] mb-4 leading-[1.05] tracking-[-0.02em]" style={H}>
              We&apos;re People<br /><span style={serif}>Just Like You.</span>
            </h3>
            <p className="text-[#A3ACBD] text-sm sm:text-base leading-relaxed mb-8 max-w-md">We are a community of believers passionate about Jesus Christ, rooted in the Word of God, and empowered by the Holy Spirit.</p>
            <Link href="/new-here" className="inline-flex items-center gap-2 bg-white text-[#111827] hover:bg-gray-100 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all" style={H}>Plan a Visit <ArrowRight className="w-3.5 h-3.5" /></Link>
          </Reveal>

          <Reveal variant="right" delay={140} className="bg-[#BF0A30] rounded-[28px] p-8 sm:p-10 relative overflow-hidden">
            <WindField />
            <p className="relative text-white/80 text-xs font-bold uppercase tracking-widest mb-3" style={H}>Get Involved</p>
            <h3 className="relative text-white text-3xl md:text-[40px] mb-4 leading-[1.05] tracking-[-0.02em]" style={H}>
              Connect to Your<br /><span style={serif}>Life&apos;s Purpose.</span>
            </h3>
            <p className="relative text-white/85 text-sm sm:text-base leading-relaxed mb-8 max-w-md">God wants to use you to make an impact in the world. You have unique gifts and talents that can transform our community.</p>
            <Link href="/r-connect" className="relative inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all" style={H}>Be Connected <ArrowRight className="w-3.5 h-3.5" /></Link>
          </Reveal>
        </div>
      </section>

      {/* ══ You're Family: the outline fills as it passes ══════════ */}
      <section ref={familyRef} className="bg-[#F5F0E8] py-6 overflow-hidden border-y border-[#E0D8CE]" aria-label="You're Family.">
        <div className="flex w-max animate-[marquee_30s_linear_infinite]" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className={`${s.familyWord} text-[72px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap pr-10`} style={{ ...H }}>
              You&apos;re Family.
            </span>
          ))}
        </div>
      </section>

      {/* ══ Communities: dealt out from one stack ══════════════════ */}
      <section className="bg-[#F5F0E8] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Reveal variant="none" className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-[34px] sm:text-[40px] md:text-6xl text-[#111827] leading-[1.02] tracking-[-0.02em]" style={H}>
                <RiseLine index={0}>There is a place here</RiseLine>
                <RiseLine index={1} style={serif}>for Everybody.</RiseLine>
              </h2>
              <WindLine className="mt-4" width={180} />
            </div>
            <RiseLine index={2} className="self-start sm:self-auto">
              <Link href="/r-communities" className="inline-flex items-center gap-1.5 border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all" style={H}>
                All Communities →
              </Link>
            </RiseLine>
          </Reveal>
          <Reveal variant="none" className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${s.deal}`}>
            {COMMUNITIES.map((c, ci) => (
              <div
                key={c.href}
                className={s.card}
                style={{
                  ['--n' as string]: ci,
                  ['--fx' as string]: `${(0.5 - (ci % 2)) * 104}%`,
                  ['--fy' as string]: `${(0.5 - Math.floor(ci / 2)) * 104}%`,
                  ['--fxl' as string]: `${(1.5 - ci) * 104}%`,
                  ['--fr' as string]: `${(ci - 1.5) * 4}deg`,
                }}
              >
                <Link href={c.href} className={`group relative rounded-[24px] overflow-hidden block ${s.cardLink}`} style={{ aspectRatio: '3/4' }}>
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover" loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                    <div className={`p-3.5 sm:p-4 ${s.cardPanel}`}>
                      <p className="text-white font-black text-sm sm:text-base leading-tight" style={H}>{c.name}</p>
                      <p className="text-white/60 text-[10px] sm:text-[11px] uppercase tracking-wider mt-0.5">{c.sub}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[#FF5A79] text-[11px] font-bold" style={H}>
                        Learn More →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ══ Impact + Rhema Feast ═══════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-20 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Reveal variant="none" className="text-center">
            <p className="text-[#FF5A79] text-[11px] font-bold uppercase tracking-widest mb-3" style={H}>Our Impact</p>
            <h2 className="text-[34px] sm:text-[40px] md:text-6xl font-black text-white leading-[1.02] tracking-[-0.02em] mb-4" style={H}>
              <RiseLine index={0}>God Is Moving</RiseLine>
              <RiseLine index={1} style={serif}>at Ruach</RiseLine>
            </h2>
            <WindLine className="mx-auto mb-5" width={180} />
          </Reveal>
          <Reveal variant="blur" delay={200} as="p" className="text-[#A3ACBD] text-sm sm:text-base text-center max-w-md mx-auto mb-12">
            Every Sunday, lives are transformed. Every week, the Kingdom grows. Here is what God has done — and is still doing.
          </Reveal>

          {/* Ledger, not tiles: one ruled row */}
          <dl className="grid grid-cols-2 md:grid-cols-4 border-y border-white/10 mb-12">
            {STATS.map((st, si) => (
              <Reveal key={st.label} variant="up" delay={si * 90}
                className={`py-6 sm:py-8 px-3 sm:px-6 ${si % 2 === 1 ? 'border-l border-white/10' : ''} ${si >= 2 ? 'border-t md:border-t-0 border-white/10' : ''} ${si === 2 ? 'md:border-l' : ''}`}>
                <dt className="sr-only">{st.label}</dt>
                <dd>
                  <p className="text-[30px] sm:text-[40px] lg:text-[44px] font-black text-white leading-none mb-3 tabular-nums tracking-[-0.02em]" style={H}>
                    <CountUp value={st.number} />
                  </p>
                  <p className="text-white text-xs sm:text-sm font-bold mb-0.5" style={H} aria-hidden>{st.label}</p>
                  <p className="text-[#8B95A8] text-[11px] sm:text-xs">{st.sub}</p>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {/* Rhema Feast filmstrip drifts as you scroll */}
        <div ref={stripRef} className="px-4 sm:px-6 lg:px-12">
          <div className={s.strip}>
            {[...RHEMA, ...RHEMA.slice(0, 1)].map((img, i) => (
              <Reveal key={i} variant="up" delay={i * 120} className="img-curtain relative overflow-hidden rounded-[24px] flex-shrink-0 w-[78vw] sm:w-[46vw] lg:w-[34vw]" style={{ aspectRatio: '4/3' }}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="img-curtain-img w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/rhema-feast.jpg'; }}
                />
              </Reveal>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Reveal variant="fade" delay={300} className="mt-5">
            <p className="text-white font-black text-lg sm:text-xl" style={H}>Rhema Feast 2025</p>
            <p className="text-[#8B95A8] text-sm">10th Edition · Uhuru Park, Nairobi · 100,000+ in attendance</p>
          </Reveal>
        </div>
      </section>

      {/* ══ What to Expect: cards stack as you scroll ═════════════ */}
      <section className="bg-[#F5F0E8] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Reveal variant="none" className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#BF0A30] text-[11px] font-bold uppercase tracking-widest mb-3" style={H}>What to Expect</p>
              <h2 className="text-[34px] sm:text-[40px] md:text-6xl text-[#111827] leading-[1.02] tracking-[-0.02em]" style={H}>
                <RiseLine index={0}>What happens when</RiseLine>
                <RiseLine index={1} style={serif}>you show up.</RiseLine>
              </h2>
            </div>
            <RiseLine index={2} className="self-start md:self-auto">
              <Link href="/new-here" className="inline-flex items-center gap-1.5 border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all" style={H}>
                Plan a Visit →
              </Link>
            </RiseLine>
          </Reveal>
          <div className={`flex flex-col gap-5 ${s.stack}`}>
            {PILLARS.map((item, pi) => (
              <article
                key={item.label}
                className={`${s.stackCard} relative rounded-[28px] overflow-hidden bg-[#0A0C10] shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.35)] h-[440px] sm:h-[480px] md:h-[min(560px,70vh)]`}
                style={{ ['--n' as string]: pi }}
              >
                <img src={item.img} alt={item.alt} className="absolute inset-0 w-full h-full object-cover md:w-3/5 md:left-auto md:right-0" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent md:bg-gradient-to-r md:from-[#0A0C10] md:via-[#0A0C10]/85 md:to-transparent" />
                <div className="absolute inset-0 p-7 sm:p-10 flex flex-col justify-end md:justify-center md:max-w-[52%]">
                  <p className="text-[#FF5A79] text-[11px] font-black uppercase tracking-widest mb-3" style={H}>{item.label}</p>
                  <h3 className="text-white text-[28px] md:text-5xl font-black leading-[1.05] tracking-[-0.02em] mb-4" style={H}>{item.title}</h3>
                  <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-md">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Upcoming events ════════════════════════════════════════ */}
      <section className="bg-[#000] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Reveal variant="fade" className="flex items-center justify-between gap-4 mb-10 flex-wrap">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-[#BF0A30]" />
              <span className="text-white/55 text-xs font-bold uppercase tracking-widest" style={H}>
                {upcomingEvents.length > 0 ? 'Upcoming Events' : 'Upcoming Event'}
              </span>
            </div>
            <Link href="/r-events" className="text-white/55 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors" style={H}>
              All Events →
            </Link>
          </Reveal>

          {upcomingEvents.length === 0 ? (
            <Reveal variant="up" className="relative text-center py-14 px-6 rounded-[28px] overflow-hidden bg-[#0E1117] border border-white/10">
              <WindLine className="mx-auto mb-6" width={140} />
              <p className="text-white/65 text-sm sm:text-base mb-4">No upcoming events at the moment.</p>
              <Link href="/r-events" className="text-[#FF5A79] text-xs font-bold uppercase tracking-widest hover:underline underline-offset-4" style={H}>View Past Events →</Link>
            </Reveal>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((ev, evi) => {
                const dateLabel = new Date(ev.event_date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <Reveal key={ev.id} variant="up" delay={evi * 110} className="rounded-[24px] overflow-hidden flex flex-col bg-[#0E1117] border border-white/10">
                    {ev.image_url && (
                      <div className="aspect-square overflow-hidden">
                        <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }} />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-[#FF5A79] text-[11px] font-bold uppercase tracking-widest mb-2" style={H}>{dateLabel}{ev.start_time ? ` · ${ev.start_time}` : ''}</p>
                      <h3 className="text-white text-xl font-black mb-3 flex-1" style={H}>{ev.title}</h3>
                      {ev.description && <p className="text-white/55 text-sm leading-relaxed mb-4 line-clamp-2">{ev.description}</p>}
                      {ev.location && (
                        ev.map_url ? (
                          <a href={ev.map_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-white/55 hover:text-white text-xs mb-4 transition-colors">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#BF0A30] mt-0.5" /> {ev.location} <span className="text-[#FF5A79] font-bold">· Directions</span>
                          </a>
                        ) : (
                          <p className="flex items-start gap-2 text-white/50 text-xs mb-4">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#BF0A30] mt-0.5" /> {ev.location}
                          </p>
                        )
                      )}
                      <Link href="/r-events" className="flex items-center gap-1.5 text-[#FF5A79] text-xs font-bold uppercase tracking-widest mt-auto" style={H}>
                        More Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ Sermons ════════════════════════════════════════════════ */}
      {recentSermons.length > 0 && (
        <section className="bg-[#0A0C10] py-16 sm:py-24 border-t border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <Reveal variant="none" className="flex items-center justify-between gap-4 mb-8 px-4 sm:px-6 lg:px-12">
              <h2 className="text-3xl md:text-5xl text-white leading-tight tracking-[-0.02em]" style={H}>
                <RiseLine index={0}>Sermons</RiseLine>
              </h2>
              <RiseLine index={1}>
                <Link href="/sermons" className="inline-block flex-shrink-0 border border-white/25 text-white/80 hover:text-white hover:border-white/50 font-bold text-[11px] sm:text-xs uppercase tracking-widest px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl transition-all" style={H}>
                  View All →
                </Link>
              </RiseLine>
            </Reveal>
            <Reveal variant="scale" className="px-4 sm:px-6 lg:px-12">
              <div className="rounded-[28px] overflow-hidden border border-white/10">
                <ThemeHero sermons={recentSermons} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══ Gallery ════════════════════════════════════════════════ */}
      <ExpectGallery />

      {/* ══ FAQs ═══════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-24 bg-[#0A0C10] overflow-hidden">
        <img src="/church-photos/dark-background-3.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.12]" loading="lazy" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
            <Reveal variant="left">
              <h2 className="text-5xl text-white mb-4 tracking-[-0.02em]" style={H}>FAQs</h2>
              <WindLine className="mb-5" width={140} />
              <p className="text-[#A3ACBD] text-sm leading-relaxed">These are frequently asked questions about Ruach Tabernacle.</p>
              <Link href="/all-about-ruach" className="mt-6 inline-flex items-center gap-1.5 text-[#FF5A79] text-xs font-bold uppercase tracking-wider" style={H}>
                All About Ruach <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>
            <div className="lg:col-span-2 space-y-3">
              {FAQS.map((f, i) => (
                <Reveal key={i} variant="up" delay={i * 70}>
                  <FaqItem q={f.q} a={f.a} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Service role (server-only) so RLS doesn't hide events from the public homepage.
    const eventsQuery = (cols: string) => supabaseAdmin.from('events').select(cols)
      .eq('is_public', true)
      .or(`event_date.gte.${today},end_date.gte.${today}`).neq('status', 'cancelled').order('event_date', { ascending: true }).limit(2);
    const EVENTS_BASE = 'id,title,description,event_date,end_date,start_time,location,image_url';
    const [{ data: sermons }, { data: stream }, eventsRes] = await Promise.all([
      supabase.from('sermons').select('id,title,slug,preacher,service_date,youtube_url,thumbnail_url,description').order('service_date', { ascending: false }).limit(12),
      supabase.from('stream_settings').select('is_live').limit(1).single(),
      eventsQuery(`${EVENTS_BASE},map_url`),
    ]);
    // Fall back to base columns if map_url isn't migrated yet (error → data null).
    const events = eventsRes.data ?? (eventsRes.error ? (await eventsQuery(EVENTS_BASE)).data : []);
    return {
      props: {
        recentSermons:  sermons ?? [],
        isLive:         stream?.is_live ?? false,
        upcomingEvents: events ?? [],
      },
      revalidate: 300,
    };
  } catch {
    return { props: { recentSermons: [], isLive: false, upcomingEvents: [] }, revalidate: 300 };
  }
};
