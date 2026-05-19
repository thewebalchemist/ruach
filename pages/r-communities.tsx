import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const heading = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const COMMUNITIES = [
  { name: 'R-Kids Church',        sub: 'Children Ministry',   href: '/r-kids-church',          img: '/kids/children-1.jpeg' },
  { name: 'Trendsetters',         sub: 'Teens Church',         href: '/rt-teens-church',        img: '/church-photos/aug-2025-c.jpg' },
  { name: 'Bridge',               sub: 'Youth Church',         href: '/rt-youth-church',        img: '/church-photos/june-2025.jpg' },
  { name: 'Crosspoints',          sub: 'Home Church',          href: '/r-crosspoints',          img: '/church-photos/aug-2025-a.jpg' },
  { name: 'R-Warriors',           sub: "Men's Ministry",       href: '/rt-warriors',            img: '/church-photos/aug-2025-b.jpg' },
  { name: 'Kingdom Woman',        sub: "Women's Ministry",     href: '/rt-kingdom-woman',       img: '/church-photos/advancing-kingdom.jpg' },
  { name: 'Marriage Ministry',    sub: 'Marriages & Families', href: '/rt-marriage-ministry',   img: '/church-photos/dec-2024.jpg' },
  { name: 'R-Worship',            sub: 'Worship Team',         href: '/rt-worship',             img: '/church-photos/rhema-feast.jpg' },
  { name: 'Media Team',           sub: 'Production & Media',   href: '/rt-media',               img: '/church-photos/dec-2024.jpg' },
  { name: 'Intercessors',         sub: 'Prayer Ministry',      href: '/rt-intercessors',        img: '/church-photos/aug-2025-b.jpg' },
  { name: 'Evangelists',          sub: 'Outreach Ministry',    href: '/rt-evangelists',         img: '/church-photos/IMG_7023.jpg' },
  { name: 'Hospitality',          sub: 'Guest Services',       href: '/rt-hospitality',         img: '/church-photos/IMG_1716.jpg' },
  { name: 'Care and Counselling', sub: 'Pastoral Care',        href: '/r-care-and-counselling', img: '/church-photos/about-carousel.avif' },
  { name: 'Guest Experience',     sub: 'First Impressions',    href: '/rt-guest-experience',    img: '/church-photos/aug-2025-b.jpg' },
];


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
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-bold text-[#111827] text-sm" style={heading}>{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-1 text-[#6B7280] text-sm leading-relaxed bg-white">{a}</div>}
    </div>
  );
}

export default function RCommunitiesPage() {
  return (
    <Layout title="R-Communities" description="Find your circle at Ruach Tabernacle. We believe real life change happens through authentic relationships — communities for kids, teens, youth, men, women, and more.">

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'url(/church-photos/dark-background-2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <img src="/church-photos/rhema-feast.jpg" alt="Ruach Communities" className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-transparent" />
        </div>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span className="text-[100px] md:text-[160px] italic text-white/5 whitespace-nowrap leading-none select-none" style={heading}>
            R-Communities. &nbsp; R-Communities.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pb-20 pt-32 w-full">
          <h1 className="text-6xl md:text-7xl text-white tracking-tight" style={heading}>Find Your Circle</h1>
        </div>
      </section>

      {/* TAGLINE */}
      <section className="bg-[#F5F0E8] py-12 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-3xl md:text-4xl text-[#111827] mb-5" style={heading}>Have people to do life with!</h3>
          <p className="text-[#6B7280] leading-relaxed">
            We believe that real life change and growth happens through authentic relationships. You can&apos;t do life with everyone, but we can create a world where everyone has someone to do life with.
          </p>
        </div>
      </section>

      {/* JOIN COMMUNITY MARQUEE */}
      <section className="bg-[#F5F0E8] py-5 overflow-hidden border-y border-[#E8E0D0]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`a${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>Join Community.</span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`b${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>Join Community.</span>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITIES GRID */}
      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl text-white" style={heading}>Join Community.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {COMMUNITIES.map((c) => (
              <Link key={c.href} href={c.href} className="group relative aspect-square rounded-2xl overflow-hidden block">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-80"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <p className="text-white font-black text-sm leading-tight" style={heading}>{c.name}</p>
                    <p className="text-white/60 text-[10px] uppercase tracking-wider mt-0.5">{c.sub}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-white/70 group-hover:text-white text-[10px] font-bold transition-colors" style={heading}>
                      Learn More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ExpectGallery />

      {/* FAQ */}
      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-6">
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
