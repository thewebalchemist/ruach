import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/shared/Layout';

const heading = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const PROGRAMS = [
  {
    name: 'Little Angels',
    age: 'Ages 0–2',
    desc: 'A safe and nurturing environment for our tiniest members. Trained volunteers care for your infants and toddlers while you worship.',
  },
  {
    name: 'Sparks',
    age: 'Ages 3–5',
    desc: 'A fun-filled space where pre-schoolers learn about Jesus through play, songs, and interactive Bible stories.',
  },
  {
    name: 'Disciples',
    age: 'Ages 6–9',
    desc: 'Engaging lessons, games, and crafts that help early elementary children build a solid foundation in God\'s Word.',
  },
  {
    name: 'Redeemers',
    age: 'Ages 10–12',
    desc: 'Dynamic teaching and age-appropriate activities that challenge pre-teens to own their faith and live it out boldly.',
  },
];

const FAQS = [
  { q: 'What are your services like?', a: 'We provide an inviting atmosphere where everyone is welcome. Our services are a little over an hour long — filled with powerful worship, practical teachings that will help grow your faith in God, and a community of people that want to do life with you.' },
  { q: 'What should I wear?', a: 'We welcome you to come as you are. Whether you prefer to dress up or dress down, we encourage you to wear modestly and decently. Come comfortable.' },
  { q: 'How is it like visiting for the first time?', a: "We are committed to making sure that your first visit is enjoyable and stress-free. We won't single you out, make you stand up, or pressure you for money. Explore at your own pace." },
  { q: 'What about my kids?', a: "We know that your children are a big priority. We aim to create a safe, fun, and engaging environment through RT Kids — with games, interactive Bible lessons, and creative crafts. All volunteers are thoroughly vetted." },
  { q: 'How can I get connected?', a: 'Getting connected is easy! Attend our Connect Class to learn everything about Ruach, or join a Crosspoint (home church) where you can connect with people in your zone and grow in your faith.' },
];

const GALLERY = [
  '/church-photos/rhema-feast.jpg',
  '/church-photos/june-2025.jpg',
  '/church-photos/aug-2025-a.jpg',
  '/church-photos/aug-2025-b.jpg',
  '/church-photos/advancing-kingdom.jpg',
  '/church-photos/dec-2024.jpg',
  '/church-photos/aug-2025-b.jpg',
  '/church-photos/aug-2025-c.jpg',
  '/church-photos/dec-2024.jpg',
  '/church-photos/IMG_7023.jpg',
  '/church-photos/IMG_1716.jpg',
  '/church-photos/about-carousel.avif',
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-bold text-white text-sm" style={heading}>{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6 pt-2 text-[#8B95A8] text-sm leading-relaxed bg-white/[0.03]">{a}</div>}
    </div>
  );
}

export default function RKidsChurchPage() {
  return (
    <Layout title="R-Kids Church" description="R-Kids is all about having fun and knowing Jesus. A safe, engaging environment for children at Ruach Tabernacle.">

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/kids/children-1.jpeg" alt="R-Kids Church" className="w-full h-full object-cover opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
        </div>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span className="text-[100px] md:text-[160px] italic text-white/5 whitespace-nowrap leading-none select-none" style={heading}>
            R-Kids. &nbsp; R-Kids.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={heading}>Children&apos;s Ministry</p>
          <h1 className="text-5xl md:text-6xl text-white leading-tight mb-4" style={heading}>
            R-Kids is all about<br />having fun and<br /><span className="text-[#BF0A30]">knowing Jesus.</span>
          </h1>
        </div>
      </section>

      {/* TEAM LEADER WELCOME */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={heading}>A Word from The Team Leader</p>
              <p className="text-[#374151] leading-relaxed mb-5">
                At R-Kids Church, we believe every child is uniquely created by God with a purpose and a destiny. Our goal is to create an environment where kids feel loved, safe, and excited to learn about Jesus — in a way that speaks to them at their level.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                We are committed to partnering with parents to raise a generation that knows God, loves His Word, and carries His presence wherever they go. Every Sunday, our trained and passionate team creates an experience your children will look forward to week after week.
              </p>
              <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-all shadow-lg shadow-[rgba(191,10,48,0.3)]" style={heading}>
                Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="/kids/children-1.jpeg" alt="R-Kids Church Team" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#F5F0E8] py-5 overflow-hidden border-y border-[#E8E0D0]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_25s_linear_infinite]" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={`a${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>R-Kids.</span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_25s_linear_infinite]" aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={`b${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>R-Kids.</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS GRID */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <h2 className="text-4xl md:text-5xl text-[#111827] mb-4" style={heading}>A fun, safe environment<br />for your kids.</h2>
          <p className="text-[#6B7280] mb-12 max-w-xl">Every age group has a specially designed program to meet your child where they are and help them grow in their faith.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {PROGRAMS.map((p) => (
              <div key={p.name} className="bg-[#000000] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white text-xl" style={heading}>{p.name}</p>
                  <span className="bg-[#BF0A30] text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full" style={heading}>{p.age}</span>
                </div>
                <p className="text-[#8B95A8] text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/new-here" className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-lg shadow-[rgba(191,10,48,0.3)]" style={heading}>
              Attend kids event <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <h2 className="text-4xl text-[#111827] mb-10" style={heading}>Here&apos;s What to Expect</h2>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {GALLERY.map((src, i) => (
              <div key={i} className="break-inside-avoid rounded-xl overflow-hidden">
                <img src={src} alt={`R-Kids ${i + 1}`} className="w-full h-auto object-cover" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <h2 className="text-4xl text-white mb-3" style={heading}>FAQs</h2>
              <p className="text-[#8B95A8] text-sm">These are frequently asked questions about Ruach Tabernacle.</p>
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
