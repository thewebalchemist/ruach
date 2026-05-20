import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const FAQS = [
  {
    q: 'Is giving mandatory to attend Ruach?',
    a: 'No. Giving is a personal act of worship and is entirely voluntary. You are welcome at Ruach regardless of whether or how much you give.',
  },
  {
    q: 'How are funds used?',
    a: 'Funds support pastoral ministry, Sunday operations, community programs, Crosspoints (home churches), R-Kids, and outreach initiatives.',
  },
  {
    q: 'Can I give to a specific ministry?',
    a: 'Yes. You can designate your gift to a specific fund (e.g., R-Kids, missions, food bank). Please indicate this when giving or contact the office.',
  },
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

const METHODS = [
  {
    icon: '📱',
    color: '#10B981',
    title: 'M-Pesa',
    desc: 'Give directly via M-Pesa. Details are announced during Sunday service or available from the church office.',
    badge: 'Available',
    badgeColor: 'bg-[rgba(16,185,129,0.15)] text-[#34D399] border border-[rgba(16,185,129,0.2)]',
  },
  {
    icon: '🏦',
    color: '#3B82F6',
    title: 'Bank Transfer',
    desc: 'Bank details are available at the church office. Contact us for more information and account details.',
    badge: 'Contact Office',
    badgeColor: 'bg-[rgba(59,130,246,0.15)] text-[#93C5FD] border border-[rgba(59,130,246,0.2)]',
  },
  {
    icon: '🙌',
    color: '#BF0A30',
    title: 'In Person',
    desc: 'Give during Sunday service. Offering baskets are passed during the service — every Sunday, all three services.',
    badge: 'Every Sunday',
    badgeColor: 'bg-[rgba(191,10,48,0.15)] text-[#F87171] border border-[rgba(191,10,48,0.2)]',
  },
];

export default function GivePage() {
  return (
    <Layout
      title="Give — Ruach Tabernacle"
      description="Support the work of God at Ruach Tabernacle. Give via M-Pesa, bank transfer, or in person every Sunday."
    >

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'url(/church-photos/dark-backround.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <img
            src="/church-photos/worship-ruach.jpg"
            alt="Generosity"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '0%', right: '5%', filter: 'blur(140px)', opacity: 0.10, ['--spirit-dur' as string]: '11s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Generosity</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight tracking-tight mb-5" style={H}>
            Give to the<br /><span style={serif}>Work of God</span>
          </h1>
          <blockquote className="text-[#8B95A8] text-base italic max-w-lg leading-relaxed" style={serif}>
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            <cite className="not-italic block text-[#BF0A30] text-xs font-bold uppercase tracking-widest mt-2" style={H}>2 Corinthians 9:7</cite>
          </blockquote>
        </div>
      </section>

      {/* ── GIVING METHODS ────────────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Ways to Give</p>
          <h2 className="text-4xl md:text-5xl text-[#111827] mb-12 leading-tight" style={H}>
            Giving is<br /><span style={serif}>an act of worship.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {METHODS.map((m) => (
              <div key={m.title} className="bg-[#000000] rounded-2xl p-8 flex flex-col">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
                  style={{ background: `${m.color}20` }}
                >
                  {m.icon}
                </div>
                <h3 className="text-white font-black text-lg mb-3" style={H}>{m.title}</h3>
                <p className="text-[#8B95A8] text-sm leading-relaxed flex-1 mb-5">{m.desc}</p>
                <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${m.badgeColor}`} style={H}>
                  {m.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WE GIVE ───────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Why We Give</p>
              <h2 className="text-4xl md:text-5xl text-white mb-6 leading-tight" style={H}>
                Partnering in<br /><span style={serif}>God&apos;s Mission</span>
              </h2>
              <p className="text-[#8B95A8] leading-relaxed mb-4">
                Giving at Ruach Tabernacle is an act of worship and partnership in the mission of God.
                Your generosity directly supports Sunday services, community care programs, pastoral
                ministry, Crosspoints, R-Kids, and the operational needs of the church.
              </p>
              <p className="text-[#8B95A8] leading-relaxed">
                We are committed to transparency in how funds are used. Financial reports are available
                to members upon request through the church office.
              </p>
            </div>
            <div
              className="rounded-2xl p-8"
              style={{ background: 'rgba(191,10,48,0.08)', border: '1px solid rgba(191,10,48,0.15)' }}
            >
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>What Your Giving Supports</p>
              <div className="space-y-3">
                {['Sunday Services & Worship', 'Pastoral Ministry', 'Crosspoints (Home Churches)', 'R-Kids Church', 'Community Outreach', 'Missions & Church Planting'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#BF0A30] flex-shrink-0" />
                    <span className="text-[#D1D5DB] text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-4 pb-24">
        <div className="max-w-3xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Common Questions</p>
          <h2 className="text-3xl md:text-4xl text-white mb-10" style={H}>FAQs</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-14 text-center">
        <div className="max-w-xl mx-auto px-8">
          <p className="text-[#8B95A8] text-sm mb-6">Questions about giving or stewarding finances?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
            style={H}
          >
            Contact the Office <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </Layout>
  );
}
