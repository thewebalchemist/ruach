import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const heading = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

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
      <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-bold text-white text-sm" style={heading}>{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6 pt-2 text-[#8B95A8] text-sm leading-relaxed bg-white/[0.03]">{a}</div>}
    </div>
  );
}

export default function RConnectPage() {
  return (
    <Layout title="Connect" description="Connect to your purpose at Ruach Tabernacle. Our journey begins with Connect Class, grows through Discipleship, and culminates in Service.">

      {/* HERO */}
      <section className="relative min-h-[65vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'url(/church-photos/dark-background-3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <img src="/church-photos/aug-2025-a.jpg" alt="Connect" className="absolute inset-0 w-full h-full object-cover opacity-45"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-transparent" />
        </div>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span className="text-[120px] md:text-[180px] italic text-white/5 whitespace-nowrap leading-none select-none" style={heading}>
            Connect. &nbsp; Connect.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={heading}>R-Connect</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-2" style={heading}>Connect to<br />Your Purpose</h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-[#F5F0E8] py-14">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 text-center">
          <h3 className="text-3xl md:text-4xl text-[#111827] mb-5" style={heading}>We&apos;re glad you&apos;re here.</h3>
          <p className="text-[#6B7280] leading-relaxed text-lg">
            Our journey begins with <strong className="text-[#111827]">Connect</strong>, grows through <strong className="text-[#111827]">Discipleship</strong>, and culminates in <strong className="text-[#111827]">Service</strong>. Whatever your journey looks like, we believe God will show you His plan for your life.
          </p>
        </div>
      </section>

      {/* 3 STEPS */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', label: 'KNOW THE VISION', title: 'Connect Class', desc: 'Connect Classes are designed to help you understand who we are as the Ruach Tabernacle family — our vision, mission, core values, belief system, and leadership.', href: '/connect', cta: 'Join Connect Class' },
              { num: '2', label: 'UNDERSTAND THE VISION', title: 'Discipleship Classes', desc: "Our Discipleship Classes nurture your spiritual growth by feeding your spirit with the Word of God consistently. And as you grow, you step into greater responsibility.", href: '/discipleship', cta: 'Learn More' },
              { num: '3', label: 'JOIN THE VISION', title: 'Serve', desc: "After finishing the classes you can partner in God's work by serving and committing yourself to one of the departments or communities.", href: '/r-communities', cta: 'Explore Communities' },
            ].map((s) => (
              <div key={s.num} className="bg-[#000000] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-white/5 text-9xl leading-none" style={heading}>{s.num}</div>
                <div className="relative">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#BF0A30] text-white text-sm mb-5" style={heading}>{s.num}</span>
                  <p className="text-[#8B95A8] text-[10px] font-bold uppercase tracking-widest mb-2" style={heading}>{s.label}</p>
                  <h3 className="text-white text-2xl mb-3" style={heading}>{s.title}</h3>
                  <p className="text-[#8B95A8] text-sm leading-relaxed mb-7">{s.desc}</p>
                  <Link href={s.href} className="inline-flex items-center gap-1.5 border border-white/20 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all" style={heading}>
                    {s.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/connect" className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-lg shadow-[rgba(191,10,48,0.3)]" style={heading}>
              Join Connect Class <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* QUOTE + CTA */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-4xl text-[#111827] mb-5" style={heading}>There is a place for everyone!</h3>
            <p className="text-[#6B7280] leading-relaxed mb-8">
              Join a community today to begin making a difference and find your purpose while serving others. We can all play a part in what God is doing, no matter our age or background.
            </p>
            <Link href="/r-communities" className="inline-flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-lg transition-all" style={heading}>
              Join a Community <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-[#0A0C10] rounded-2xl p-10">
            <p className="text-5xl text-[#BF0A30] leading-none mb-5" style={heading}>&ldquo;</p>
            <p className="text-white text-2xl leading-snug" style={heading}>
              We believe the greatest leadership is service to others.
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#F5F0E8] py-5 overflow-hidden border-y border-[#E8E0D0]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`a${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>You&apos;re Family.</span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`b${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>You&apos;re Family.</span>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITIES PREVIEW */}
      <section className="bg-[#0A0C10] py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl text-white" style={heading}>A place for you and your family</h2>
            <Link href="/r-communities" className="border border-white/20 text-white hover:border-white/40 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all" style={heading}>Check More →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "What about the kids?", sub: 'R-Kids Church', href: '/r-kids-church', img: '/communities/r-kids.jpeg', cta: 'Check R-Kids' },
              { name: "What about the teens?", sub: 'Trendsetters', href: '/trendsetters', img: '/communities/the-bridge2.jpg', cta: 'Check Trendsetters' },
              { name: "What about the young adults?", sub: 'Bridge Youth', href: '/the-bridge', img: '/communities/the-bridge.jpg', cta: 'Check Bridge' },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group relative aspect-[4/3] rounded-2xl overflow-hidden block">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white" style={heading}>{c.name}</p>
                  <span className="mt-2 inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg group-hover:bg-[#BF0A30] transition-colors" style={heading}>
                    {c.cta} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-14 text-center">
        <div className="max-w-2xl mx-auto px-8 lg:px-16">
          <h2 className="text-4xl text-white mb-4" style={heading}>Attend an event.</h2>
          <p className="text-red-100 mb-8">Check out some of our upcoming events on the calendar.</p>
          <Link href="/r-events" className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-xl transition-all" style={heading}>Events Calendar <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </section>

      <ExpectGallery />

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
