import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const heading = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const LEADERSHIP = [
  {
    name: 'Rev. Julian Kyula',
    title: 'Founder & Overseer',
    role: 'Bishop Julian is the visionary founder and overseer of Ruach Assemblies — a dedicated spiritual leader and highly successful serial entrepreneur who founded the MODE Group, a fintech company that expanded into 26 countries.',
    img: '/brand/rev-julian.png',
    href: '/our-team/rev-julian-kyula',
    featured: true,
  },
  {
    name: 'Pst. Ekelemu Ewomazino',
    title: 'Senior Pastor — Ruach Tabernacle',
    role: 'Leading Ruach Tabernacle with a mandate to Raise Kingdom Champions — men and women intentional about pursuing their divine purpose in every sphere of influence.',
    img: '/pastors/pst-zino.jpg',
    href: '/our-team/pst-zino',
    featured: true,
  },
];

const ASSOCIATE_PASTORS = [
  { name: 'Pst. Emmanuel Mule', title: 'Elder | Worship Leader | Discipleship Mentor', img: '/pastors/pst-mule.jpeg', href: '/our-team/pst-mule' },
  { name: 'Pst. Kevin Owino',   title: 'JKG Resident Pastor | Author | Ministerial Trainer', img: '/pastors/pst-ivlyn.jpeg', href: '/our-team/pst-kev-owino' },
  { name: 'Pst. Maureen Wanjiku', title: 'Kingdom Woman Leader | Pastor | Director', img: '/pastors/pst-maureen.jpg', href: '/our-team/maureen-wanjiku' },
];

const ELDER_BOARD = [
  { name: 'Pst. David Kimani',    title: 'R Warriors President | Elder | Pastor | Editor', img: '/church-photos/IMG_1716.jpg', href: '/our-team/pst-david-kimani' },
  { name: 'Rev Beverly Mwangombe', title: 'Care & Counselling Pastor | Psychotherapist', img: '/church-photos/rev-bev.jpeg', href: '/our-team/rev-beverly' },
  { name: 'Pst. Elizabeth Akinyl', title: 'Teacher | Pastor | Musician | Editor', img: '/church-photos/pst-liz.jpeg', href: '/our-team/elizabeth-akinyi' },
];

export default function OurTeamPage() {
  return (
    <Layout title="Our Team" description="Meet the God-given team behind Ruach Tabernacle — our founder, senior pastor, associate pastors, and elder board.">

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/church-photos/rhema-feast.jpg" alt="Meet our team" className="w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-transparent" />
        </div>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span className="text-[80px] md:text-[140px] italic text-white/5 whitespace-nowrap leading-none select-none" style={heading}>
            Meet the Team. &nbsp; Meet the Team.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pb-16 pt-24 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={heading}>Leadership</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-white tracking-tight" style={heading}>Meet Our<br />God-given Team</h1>
        </div>
      </section>

      {/* LEADERSHIP — Founder + Senior Pastor */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {LEADERSHIP.map((member, i) => (
            <div key={member.href} className={`grid md:grid-cols-5 gap-10 items-start`}>
              <div className={`md:col-span-3 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={heading}>{member.title}</p>
                <h2 className="text-4xl text-[#111827] mb-4" style={heading}>{member.name}</h2>
                <p className="text-[#6B7280] leading-relaxed mb-6">{member.role}</p>
                <Link href={member.href} className="inline-flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-lg transition-all" style={heading}>
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className={`md:col-span-2 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="relative rounded-3xl overflow-hidden aspect-[3/4] shadow-xl shadow-black/10">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#F5F0E8] py-5 overflow-hidden border-y border-[#E8E0D0]">
        <div className="flex whitespace-nowrap">
          <div className="flex items-center gap-16 animate-[marquee_28s_linear_infinite]" style={{ width: 'max-content' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-5xl md:text-7xl italic text-[#BF0A30]/10 tracking-tight flex-shrink-0" style={heading}>Meet the Team.</span>
            ))}
          </div>
        </div>
      </section>

      {/* ASSOCIATE PASTORS */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={heading}>Leadership</p>
          <h2 className="text-4xl md:text-5xl text-[#111827] mb-12" style={heading}>Associate Pastors</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {ASSOCIATE_PASTORS.map((p) => (
              <Link key={p.href} href={p.href} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                <div className="aspect-[3/4] overflow-hidden bg-[#1A1E28]">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                </div>
                <div className="p-6">
                  <h3 className="text-[#111827] text-xl mb-1" style={heading}>{p.name}</h3>
                  <p className="text-[#8B95A8] text-xs font-medium uppercase tracking-wider">{p.title}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[#BF0A30] text-xs font-bold uppercase tracking-wider" style={heading}>
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ELDER BOARD */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={heading}>Governance</p>
          <h2 className="text-4xl md:text-5xl text-[#111827] mb-12" style={heading}>Elder Board</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {ELDER_BOARD.map((p) => (
              <Link key={p.href} href={p.href} className="group bg-[#F5F0E8] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] overflow-hidden bg-[#1A1E28]">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
                </div>
                <div className="p-6">
                  <h3 className="text-[#111827] text-xl mb-1" style={heading}>{p.name}</h3>
                  <p className="text-[#8B95A8] text-xs font-medium uppercase tracking-wider">{p.title}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[#BF0A30] text-xs font-bold uppercase tracking-wider" style={heading}>
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
}
