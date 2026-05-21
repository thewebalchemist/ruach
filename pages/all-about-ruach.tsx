import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const FAQS = [
  { q: 'What does "Ruach" actually mean? Is it an acronym?', a: 'The word Ruach is a Hebrew term traditionally translated as "breath," "wind," or "spirit." In a biblical context, it refers to the life-giving breath of God found in Genesis. However, at our church, it serves a dual purpose as an acronym: Rhema United Assemblies of Christ. This reflects our commitment to the "Rhema" (the spoken, revealed Word of God) and our unity as a body of believers.' },
  { q: 'How long has Ruach been around?', a: "The ministry's journey began in 2007 when Rev. Julian Kyula founded what was originally known as The Purpose Centre Church. Over nearly two decades, the ministry has evolved, celebrated its 18th anniversary in May 2025, and transitioned into the global network known as Ruach Assemblies." },
  { q: 'What is a "Kingdom Champion"?', a: "Our core mandate is to raise Kingdom Champions. This means we don't just want you to be good at \"doing church\"; we want to empower you to be a leader in your professional field — be it business, government, education, or the arts. We believe your work is your worship." },
  { q: 'Where exactly is Ruach Tabernacle located?', a: 'Ruach Tabernacle, our flagship global headquarters, is located at Rhema Grounds on Rhema Avenue, along the Northern Bypass. We are situated right next to the Shell Windsor station in Nairobi.' },
  { q: 'Are there other branches?', a: 'Yes! To better serve Nairobi and beyond, we have established several assemblies: Ruach West (Mövenpick Hotel, Westlands), Ruach East (Ruach East Grounds, ICD Road, off Mombasa Road, next to Ideal Ceramics), Ruach South (Waterfront Mall, Karen), and Ruach Rivers/North (Havilah Ranch, Northern Bypass).' },
  { q: 'What time are the services and how long do they last?', a: 'Join us every Sunday at 8AM, 10AM or 12:30PM. Our Sunday services are intentionally designed to be high-impact and concise, typically lasting a little over an hour.' },
  { q: 'Who is Rev Julian Kyula?', a: 'Bishop Julian is the visionary founder and overseer of Ruach Assemblies. He is both a dedicated spiritual leader and a highly successful serial entrepreneur. He founded the MODE Group, a fintech company that expanded into 26 countries, and currently chairs Beulah City Ltd, a massive housing development initiative.' },
  { q: 'What is JKM Global?', a: 'JKM Global (Julian Kyula Ministries) is the apostolic and mentorship arm of the ministry. Launched in 2025, its goal is to provide strategic oversight and leadership training for churches and marketplace leaders worldwide.' },
  { q: 'What is "Rhema Feast"?', a: "Rhema Feast is our massive annual conference. The 10th edition in 2025 was held at Uhuru Park, attracting thousands of people and world-renowned speakers and worshipers. It is a non-denominational gathering focused on reviving the spirit of the nation and the continent." },
  { q: 'What is the "Rhema Experience"?', a: "This is our hallmark service, usually held on Mondays. While Sunday is a celebration, the Rhema Experience focuses on deeper biblical teaching, prophetic ministry, and empowering mentorship. It's the perfect \"spiritual recharge\" for your week ahead." },
  { q: 'What is the plan for my children (RT Kids)?', a: 'We take children seriously. RT Kids and RT Teens provide age-appropriate, fast-paced environments where children learn biblical principles through play, crafts, and interactive lessons. Every volunteer is vetted and trained in child safety protocols to give you total peace of mind.' },
  { q: 'How do I actually meet people?', a: 'Large churches can feel anonymous but your Crosspoint is where you can find belonging. There are groups where you will build genuine friendships and get real support. We also recommend the R-Connect Class for anyone looking to officially join the Ruach family.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-bold text-white text-sm leading-snug" style={H}>{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-white/[0.03]">
          <p className="text-[#8B95A8] text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function AllAboutRuachPage() {
  return (
    <Layout
      title="All About Ruach"
      description="Everything you want to know about Ruach Tabernacle — what Ruach means, our history, branches, services, leadership, and more."
    >

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/worship-ruach.jpg"
            alt="All About Ruach"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '0%', filter: 'blur(150px)', opacity: 0.10, ['--spirit-dur' as string]: '11s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <div
            className="inline-flex items-center gap-2 text-[#F87171] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(191,10,48,0.2)', border: '1px solid rgba(191,10,48,0.35)' }}
          >
            <span style={H}>All About Ruach</span>
          </div>
          <h1 className="text-5xl md:text-7xl text-white leading-tight tracking-tight mb-5" style={H}>
            Everything You<br /><span style={serif}>Want to Know</span>
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-md">
            Your questions answered — who we are, where we came from, and where we&apos;re going.
          </p>
        </div>
      </section>

      {/* ── BRANCHES ──────────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
                Our Locations
              </p>
              <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
                5 Assemblies.<br />
                <span style={serif}>One family.</span>
              </h2>
            </div>
            <p className="text-[#8B95A8] max-w-xs text-sm leading-relaxed">
              We have established several assemblies across Nairobi to bring the church closer to you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Flagship — spans 2 cols */}
            <div
              className="lg:col-span-2 rounded-3xl relative overflow-hidden min-h-[220px] flex flex-col justify-between p-8"
              style={{ background: 'linear-gradient(135deg, #BF0A30 0%, #7A0020 100%)' }}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
              <div className="relative">
                <span
                  className="inline-block text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  Flagship HQ
                </span>
                <p className="text-white font-black text-2xl leading-tight mb-1" style={H}>
                  Ruach Tabernacle
                </p>
                <p className="text-red-200 text-sm">Rhema Grounds, Northern Bypass</p>
              </div>
              <div className="relative">
                <p className="text-red-200/70 text-xs mt-6 leading-relaxed">
                  Every Sunday · 8AM · 10AM · 12:30PM
                </p>
              </div>
            </div>

            {/* Other assemblies */}
            {[
              { name: 'Ruach West',   sub: 'Mövenpick Hotel, Westlands',              n: '02' },
              { name: 'Ruach East',   sub: 'ICD Road, off Mombasa Road',              n: '03' },
              { name: 'Ruach South',  sub: 'Waterfront Mall, Karen',                  n: '04' },
              { name: 'Ruach Rivers', sub: 'Havilah Ranch, Northern Bypass',          n: '05' },
            ].map((b) => (
              <div
                key={b.name}
                className="rounded-3xl p-7 flex flex-col justify-between min-h-[180px]"
                style={{
                  background: 'rgba(18,21,28,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
                    {b.n}
                  </p>
                  <p className="text-white font-black text-lg leading-tight mb-2" style={H}>{b.name}</p>
                  <p className="text-[#8B95A8] text-xs leading-relaxed">{b.sub}</p>
                </div>
                <div
                  className="mt-5 h-px w-8"
                  style={{ background: 'rgba(191,10,48,0.4)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN FAQ ──────────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-24">
        <div className="max-w-4xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Got Questions?</p>
            <h2 className="text-4xl md:text-5xl text-white mb-4" style={H}>
              Frequently Asked<br /><span style={serif}>Questions</span>
            </h2>
            <p className="text-[#8B95A8] text-sm">Everything you want to know about Ruach — answered.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      <ExpectGallery />

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Ready to visit?</p>
          <h2 className="text-4xl text-white mb-5" style={H}>
            Your seat<br /><span style={serif}>is waiting.</span>
          </h2>
          <p className="text-red-100 text-sm mb-8">Every Sunday at 8AM, 10AM, and 12:30PM — along the Northern Bypass, next to Shell Windsor.</p>
          <Link
            href="/new-here"
            className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
            style={H}
          >
            Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </Layout>
  );
}
