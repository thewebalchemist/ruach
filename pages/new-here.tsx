import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const heading = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };


export default function NewHerePage() {
  return (
    <Layout title="New Here?" description="Planning your first visit to Ruach Tabernacle? Come as a guest, stay as family. We meet every Sunday at 8AM, 10AM and 12:30PM along the Northern Bypass, Windsor, Nairobi.">

      {/* HERO */}
      <section className="relative min-h-[75vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'url(/church-photos/dark-backround.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <img src="/church-photos/IMG_1716.jpg" alt="Welcome to Ruach Tabernacle" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
        </div>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span className="text-[100px] md:text-[160px] italic text-white/5 whitespace-nowrap leading-none select-none" style={heading}>
            Welcome Home. &nbsp; Welcome Home.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pb-24 pt-32 w-full">
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight mb-5" style={heading}>
            Come as a guest,<br /><span className="text-[#BF0A30]">Stay as family!</span>
          </h1>
          <p className="text-[#D1D5DB] text-lg mb-10 max-w-xl">
            We meet every Sunday at 8:00AM, 10:00AM, and 12:30PM. You&apos;ll find people of all ages and walks of life.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-xl transition-all shadow-lg shadow-[rgba(191,10,48,0.4)]" style={heading}>
              Get Directions
            </Link>
            <Link href="/who-we-are" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-xl transition-all" style={heading}>
              Who We Are
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#F5F0E8] py-5 overflow-hidden border-y border-[#E8E0D0]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`a${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>You&apos;re So Loved.</span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`b${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>You&apos;re So Loved.</span>
            ))}
          </div>
        </div>
      </section>

      {/* YOU'RE LOVED */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl text-[#111827] mb-3" style={heading}>You&apos;re So Loved<br />and Valued</h2>
          <p className="text-[#6B7280] mb-12">Our team is committed to making sure that your first visit is enjoyable and stress-free.</p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#000] text-white rounded-2xl p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8B95A8] mb-5" style={heading}>Sunday Service Times</p>
              {[{ n: 'First Service', t: '8:00 – 9:30 AM' }, { n: 'Second Service', t: '10:00 – 12:00 NOON' }, { n: 'Third Service', t: '12:30 – 2:00 PM' }].map((s) => (
                <div key={s.n} className="border border-white/10 rounded-xl px-4 py-3 mb-2 last:mb-0">
                  <p className="text-[10px] text-[#8B95A8] uppercase tracking-wider">{s.n}</p>
                  <p className="text-sm font-bold text-white mt-0.5" style={heading}>{s.t}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#000] rounded-2xl p-8 flex flex-col">
              <p className="text-white text-xl mb-3" style={heading}>Plan Your Visit</p>
              <p className="text-[#8B95A8] text-sm leading-relaxed flex-1">
                We are a community of believers passionate about Jesus Christ, rooted in the Word of God, and empowered by the Holy Spirit.
              </p>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-1.5 bg-[#BF0A30] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#9A0826] transition-colors" style={heading}>
                Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#BF0A30] rounded-2xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <p className="text-white text-xl mb-3" style={heading}>Connect to Your Life&apos;s Purpose</p>
              <p className="text-red-100 text-sm leading-relaxed flex-1">
                God wants to use you to make an impact in the world. You have unique gifts and talents that can transform our community.
              </p>
              <Link href="/r-connect" className="mt-6 inline-flex items-center gap-1.5 bg-white text-[#BF0A30] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-red-50 transition-colors" style={heading}>
                Get Connected <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE 2 — Connect */}
      <section className="bg-[#F5F0E8] py-5 overflow-hidden border-y border-[#E8E0D0]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee-reverse_22s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`a${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>Connect.</span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee-reverse_22s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`b${i}`} className="text-5xl md:text-7xl italic text-[#BF0A30]/20 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>Connect.</span>
            ))}
          </div>
        </div>
      </section>

      {/* KIDS */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl text-[#111827] mb-5" style={heading}>A place for your<br />kids to belong.</h2>
              <p className="text-[#6B7280] leading-relaxed mb-8">
                We&apos;re committed to providing your children a safe and welcoming environment where they can build a relationship with Jesus and experience a strong church community from a young age.
              </p>
              <Link href="/r-kids-church" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-all shadow-lg shadow-[rgba(191,10,48,0.3)]" style={heading}>
                R-Kids Church <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="/kids/children-1.jpeg" alt="R-Kids Church" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP WELCOME */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={heading}>A Welcome Message from our Founder and Overseer</p>
              <blockquote className="text-[#374151] leading-relaxed mb-5 italic text-base">
                &ldquo;Originally established as The Purpose Centre Church in 2007 by Rev. Julian Kyula, The Ruach Assemblies is a growing network of church plants passionate about transforming lives by empowering individuals to live out their God-given purpose.&rdquo;
              </blockquote>
              <p className="text-[#BF0A30] font-bold text-sm" style={heading}>— Rev. Julian Kyula</p>
              <Link href="/our-team" className="mt-5 inline-flex items-center gap-1.5 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-lg transition-all" style={heading}>Meet Our Team <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="/brand/rev-julian.png" alt="Rev. Julian Kyula" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
            </div>
          </div>
          <div className="border-t border-[#E8E0D0]" />
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1 relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="/pastors/pst-zino.jpg" alt="Pst. Ekelemu Ewomazino" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={heading}>A Welcome Message from our Senior Pastor</p>
              <blockquote className="text-[#374151] leading-relaxed mb-5 italic text-base">
                &ldquo;The RUACH Assemblies carry a God-given mandate: Raising Kingdom Champions — men and women who are intentional about pursuing their divine purpose in every sphere of influence, whether in ministry or the marketplace.&rdquo;
              </blockquote>
              <p className="text-[#BF0A30] font-bold text-sm" style={heading}>— Pst. Zino</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-14 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl text-white mb-4" style={heading}>Attend an event.</h2>
          <p className="text-red-100 mb-8">Check out some of our upcoming events on the calendar.</p>
          <Link href="/r-events" className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-xl transition-all" style={heading}>Events Calendar <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </section>

      <ExpectGallery />

    </Layout>
  );
}
