import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ChevronDown, Copy, Check } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const FAQS = [
  { q: 'Is giving mandatory to attend Ruach?', a: 'No. Giving is a personal act of worship and is entirely voluntary. You are welcome at Ruach regardless of whether or how much you give.' },
  { q: 'How are funds used?', a: 'Funds support pastoral ministry, Sunday operations, community programs, Crosspoints (home churches), R-Kids, and outreach initiatives.' },
  { q: 'Can I give to a specific ministry?', a: 'Yes. You can designate your gift to a specific fund (e.g., R-Kids, missions, food bank). Please indicate this when giving or contact the office.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-bold text-white text-sm" style={H}>{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6 pt-2 text-[#8B95A8] text-sm leading-relaxed bg-white/[0.03]">{a}</div>}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
      style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)', color: copied ? '#34D399' : 'rgba(255,255,255,0.45)' }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function GivePage() {
  return (
    <Layout title="Give" description="Support the work of God at Ruach Tabernacle. Give via M-Pesa Paybill, Wave, PayPal, or in person every Sunday.">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[62vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/church-photos/worship-ruach.jpg" alt="Generosity" className="absolute inset-0 w-full h-full object-cover opacity-35"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '0%', right: '5%', filter: 'blur(140px)', opacity: 0.10, ['--spirit-dur' as string]: '11s' }} />
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
          <span className="text-[120px] md:text-[180px] italic text-white/[0.03] whitespace-nowrap leading-none" style={H}>
            Give. &nbsp; Give. &nbsp; Give.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <div className="inline-flex items-center gap-2 text-[#F87171] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(191,10,48,0.18)', border: '1px solid rgba(191,10,48,0.30)' }}>
            <span style={H}>Generosity</span>
          </div>
          <h1 className="text-5xl md:text-7xl text-white leading-tight tracking-tight mb-5" style={H}>
            Give to the<br /><span style={serif}>Work of God</span>
          </h1>
          <blockquote className="text-[#8B95A8] text-base italic max-w-lg leading-relaxed" style={serif}>
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            <cite className="not-italic block text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mt-2" style={H}>2 Corinthians 9:7</cite>
          </blockquote>
        </div>
      </section>

      {/* ── DARK MARQUEE ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-4 border-y" style={{ background: '#0A0C10', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex whitespace-nowrap animate-[marquee_32s_linear_infinite]">
          {[...Array(2)].map((_, t) => (
            <div key={t} className="flex items-center">
              {['Give', 'Tithe', 'Offering', 'Sow', 'Prosper', 'Worship'].map((word, i) => (
                <span key={i} className="flex items-center">
                  <span className="text-[13px] uppercase tracking-[0.2em] px-6"
                    style={{ ...H, color: i % 3 === 0 ? '#BF0A30' : i % 3 === 1 ? 'white' : '#BF0A30', fontStyle: i % 3 === 1 ? 'italic' : 'normal', fontFamily: i % 3 === 1 ? '"Playfair Display", Georgia, serif' : undefined }}>
                    {word}
                  </span>
                  <span className="text-[#BF0A30] text-xs opacity-60">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── WAYS TO GIVE ──────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Ways to Give</p>
            <h2 className="text-4xl md:text-5xl text-white mb-4 leading-tight" style={H}>
              Giving is<br /><span style={serif}>an act of worship.</span>
            </h2>
            <p className="text-[#8B95A8] text-sm max-w-md leading-relaxed">
              Choose any of the methods below. Every gift sows into the vision and advances the Kingdom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* M-Pesa Paybill — FEATURED */}
            <div className="lg:col-span-2 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #BF0A30 0%, #7A0020 100%)' }}>
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
              <div className="relative">
                <span className="inline-block text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  📱 Most Popular
                </span>
                <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-2" style={H}>M-Pesa Paybill</p>
                <p className="text-white font-black text-5xl mb-2 tracking-tight" style={H}>4075905</p>
                <p className="text-red-100/70 text-sm mb-1">Account Number:</p>
                <p className="text-white font-black text-xl mb-6" style={H}>TITHE / OFFERING</p>
              </div>
              <div className="relative flex items-center gap-3">
                <CopyButton value="4075905" />
                <span className="text-red-200/60 text-xs">Copy Paybill No.</span>
              </div>
            </div>

            {/* Wave / M-Pesa Send */}
            <div className="rounded-3xl p-7 flex flex-col justify-between"
              style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 text-2xl"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  📲
                </div>
                <p className="text-[#BF0A30] text-[9px] font-bold uppercase tracking-widest mb-2" style={H}>Send Wave</p>
                <p className="text-white font-black text-2xl mb-1 tracking-tight" style={H}>0700 650 503</p>
                <p className="text-[#8B95A8] text-xs mb-1">Account Name:</p>
                <p className="text-white text-sm font-bold" style={H}>JULIAN KYULA</p>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <CopyButton value="0700650503" />
                <span className="text-white/30 text-[10px]">Copy number</span>
              </div>
            </div>

            {/* PayPal */}
            <div className="rounded-3xl p-7 flex flex-col justify-between"
              style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 text-2xl"
                  style={{ background: 'rgba(0,112,243,0.15)', border: '1px solid rgba(0,112,243,0.25)' }}>
                  💳
                </div>
                <p className="text-[#BF0A30] text-[9px] font-bold uppercase tracking-widest mb-2" style={H}>PayPal</p>
                <p className="text-white font-bold text-sm leading-snug mb-2" style={H}>accounts@purposecentre.org</p>
                <p className="text-[#8B95A8] text-xs leading-relaxed">International giving via PayPal. Use your PayPal account to send to the address above.</p>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <CopyButton value="accounts@purposecentre.org" />
                <span className="text-white/30 text-[10px]">Copy email</span>
              </div>
            </div>

          </div>

          {/* In Person row */}
          <div className="mt-5 rounded-3xl p-6 flex items-center justify-between gap-6"
            style={{ background: 'rgba(18,21,28,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(191,10,48,0.12)', border: '1px solid rgba(191,10,48,0.20)' }}>
                🙌
              </div>
              <div>
                <p className="text-white text-sm font-black" style={H}>In Person — Every Sunday</p>
                <p className="text-[#8B95A8] text-xs">Offering baskets are passed during all three Sunday services (8AM · 10AM · 12:30PM) at Rhema Grounds.</p>
              </div>
            </div>
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap"
              style={{ background: 'rgba(191,10,48,0.15)', color: '#F87171', border: '1px solid rgba(191,10,48,0.2)' }}>
              Every Sunday
            </span>
          </div>
        </div>
      </section>

      {/* ── WHY WE GIVE ───────────────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Why We Give</p>
              <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
                Partnering in<br /><span style={serif}>God&apos;s Mission</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                Giving at Ruach Tabernacle is an act of worship and partnership in the mission of God. Your generosity directly supports Sunday services, community care programs, pastoral ministry, Crosspoints, R-Kids, and the operational needs of the church.
              </p>
              <p className="text-[#374151] leading-relaxed">
                We are committed to transparency in how funds are used. Financial reports are available to members upon request through the church office.
              </p>
            </div>
            <div className="rounded-3xl p-8" style={{ background: '#111827' }}>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-5" style={H}>What Your Giving Supports</p>
              <div className="space-y-3">
                {['Sunday Services & Worship', 'Pastoral Ministry', 'Crosspoints (Home Churches)', 'R-Kids Church', 'Community Outreach & Foodbank', 'Missions & Church Planting'].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#BF0A30] flex-shrink-0" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-3xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Common Questions</p>
          <h2 className="text-3xl md:text-4xl text-white mb-10" style={H}>
            FAQs on<br /><span style={serif}>Giving</span>
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-xl mx-auto px-8">
          <h2 className="text-4xl text-white mb-4" style={H}>
            Questions?<br /><span style={serif}>We&apos;re here.</span>
          </h2>
          <p className="text-red-100 text-sm mb-8 leading-relaxed">Questions about giving or stewarding finances? Reach out to the church office — we&apos;d love to help.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all" style={H}>
            Contact Us <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </Layout>
  );
}
