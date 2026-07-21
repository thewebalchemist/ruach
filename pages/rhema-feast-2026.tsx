import Link from 'next/link';
import { ArrowRight, MapPin, CalendarDays, BookOpen, Music, HandHeart, Sparkles } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import Countdown from '@/components/rhema/Countdown';
import { RHEMA_FEAST_2026 as RF } from '@/lib/rhema-feast';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const PILLARS = [
  {
    name: 'Word',
    icon: BookOpen,
    body: 'We believe in sharing the unadulterated word of God through the vessels God has allowed us to host at Rhema. You can always count on our online resource.',
  },
  {
    name: 'Worship',
    icon: Music,
    body: 'Authentic worship remains an integral part of our fellowship and general assembly. We host a myriad of dynamically experienced worshippers from across the globe.',
  },
  {
    name: 'Prayer',
    icon: HandHeart,
    body: 'We are admonished to pray without ceasing, for this is the will of God in Christ Jesus concerning us. As a general assembly we highly esteem prayer in all we do.',
  },
];

interface Speaker { name: string; title: string; initials: string; photo?: string; }
const SPEAKERS: Speaker[] = [
  { name: 'Rev. Julian Kyula',    title: 'Convener, Rhema Feast',                 initials: 'JK' },
  { name: 'Apostle Joshua Selman', title: 'Senior Pastor, Koinonia Global',        initials: 'JS' },
  { name: 'Pst. Poju Oyemade',    title: 'Senior Pastor, The Covenant Nation',    initials: 'PO' },
  { name: 'Bishop JB Masinde',    title: 'Senior Pastor, Deliverance Church — Umoja', initials: 'JB' },
  { name: 'Bishop Kathy Kiuna',   title: 'Senior Pastor, Jubilee Christian Center', initials: 'KK' },
  { name: 'Funke Felix-Adejumo',  title: 'President, Funke Felix-Adejumo Foundation', initials: 'FA' },
];

const GALLERY = [
  '/rhema-feast/rhema-feast1.jpg',
  '/rhema-feast/rhema-feast2.jpg',
  '/rhema-feast/Rhema-Feast-1-og_image.webp',
  '/church-photos/rhema-feast.jpg',
];

function SpeakerCard({ s }: { s: Speaker }) {
  return (
    <div className="group relative rounded-3xl overflow-hidden bg-[#12151C] border border-white/[0.07] p-6 flex flex-col items-center text-center transition-all hover:border-[#D4AF37]/40 hover:-translate-y-1">
      <div className="relative w-28 h-28 rounded-full mb-5 overflow-hidden ring-2 ring-[#D4AF37]/30 group-hover:ring-[#D4AF37]/70 transition-all">
        {s.photo ? (
          <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#BF0A30] to-[#6A0010]">
            <span className="text-white text-3xl" style={H}>{s.initials}</span>
          </div>
        )}
      </div>
      <h3 className="text-white text-lg leading-tight" style={H}>{s.name}</h3>
      <p className="text-[#D4AF37] text-xs mt-2 leading-snug">{s.title}</p>
    </div>
  );
}

export default function RhemaFeast2026() {
  return (
    <Layout
      title="Rhema Feast 2026 — 31 Aug – 4 Sep · Uhuru Park, Nairobi"
      description="Rhema Feast 2026, an Apostolic movement sharing the authentic word of God to the nations. 31 August – 4 September 2026 at Uhuru Park, Nairobi. Speakers include Rev. Julian Kyula, Apostle Joshua Selman, Pst. Poju Oyemade and more."
      image="https://ruachtabernacle.org/rhema-feast/Rhema-Feast-1-og_image.webp"
    >
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0C10]">
        <img src="/rhema-feast/rhema-feast1.jpg" alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/rhema-feast.jpg'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/70 to-[#0A0C10]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/80 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-24 w-full">
          <p className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-[0.3em] mb-5" style={H}>
            <Sparkles className="w-4 h-4" /> {RF.edition} · An Apostolic Movement
          </p>
          <h1 className="text-white leading-[0.9] tracking-tight mb-6">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[120px]" style={H}>Rhema</span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[120px] text-[#BF0A30]" style={serif}>Feast 2026</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80 text-sm sm:text-base mb-10" style={H}>
            <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#D4AF37]" /> {RF.dates}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D4AF37]" /> {RF.location}</span>
          </div>

          {/* Countdown */}
          <div className="mb-10">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mb-4" style={H}>Counting down to Day One</p>
            <Countdown target={RF.target} />
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={RF.directionsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-xl shadow-[rgba(191,10,48,0.4)]" style={H}>
              <MapPin className="w-4 h-4" /> Get Directions
            </a>
            <Link href="/r-events"
              className="flex items-center gap-2 apple-glass-dark text-white font-bold text-sm uppercase tracking-wider px-7 py-4 transition-all hover:-translate-y-0.5" style={H}>
              All Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ MISSION ═══════════ */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={H}>Our Mission</p>
          <p className="text-2xl md:text-4xl text-[#111827] leading-[1.35]" style={{ ...serif, fontStyle: 'normal' }}>
            Rhema Feast is an Apostolic movement whose mission is to share the
            <span className="text-[#BF0A30]"> unadulterated and authentic word of God </span>
            to the nations and to all generations — releasing consistent value through in-person meetings, social media, and broadcasting media, for the Glory of Yahweh and the advancement of His Kingdom.
          </p>
        </div>
      </section>

      {/* ═══════════ PILLARS ═══════════ */}
      <section className="bg-[#0A0C10] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={H}>The Foundation</p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              What Are The<br /><span style={serif} className="text-[#BF0A30]">Rhema Feast Pillars?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map((p) => (
              <div key={p.name} className="rounded-3xl bg-[#12151C] border border-white/[0.07] p-8 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center mb-6">
                  <p.icon className="w-7 h-7 text-[#BF0A30]" />
                </div>
                <h3 className="text-white text-2xl mb-3" style={H}>{p.name}</h3>
                <p className="text-[#8B95A8] text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SPEAKERS ═══════════ */}
      <section className="bg-[#0A0C10] py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={H}>The Voices</p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              Speakers at <span style={serif} className="text-[#BF0A30]">Rhema Feast 2026</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {SPEAKERS.map((s) => <SpeakerCard key={s.name} s={s} />)}
          </div>
          <p className="text-center text-white/30 text-xs mt-8">More speakers and full bios to be announced.</p>
        </div>
      </section>

      {/* ═══════════ GALLERY ═══════════ */}
      <section className="bg-[#0A0C10] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {GALLERY.map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '1/1' }}>
              <img src={src} alt="Rhema Feast" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/rhema-feast.jpg'; }} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CLOSING CTA ═══════════ */}
      <section className="relative py-24 overflow-hidden bg-[#BF0A30]">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -left-12 w-72 h-72 bg-white/5 rounded-full" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-6xl text-white leading-tight mb-4" style={H}>
            We&apos;ll see you<br /><span style={serif}>at Uhuru Park.</span>
          </h2>
          <p className="text-red-100 text-sm md:text-base mb-8">{RF.dates} · Nairobi, Kenya</p>
          <div className="flex justify-center mb-10">
            <div className="bg-black/25 rounded-2xl px-6 py-4">
              <Countdown target={RF.target} />
            </div>
          </div>
          <a href={RF.directionsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-2xl transition-all" style={H}>
            <MapPin className="w-4 h-4" /> Get Directions to Uhuru Park
          </a>
        </div>
      </section>
    </Layout>
  );
}
