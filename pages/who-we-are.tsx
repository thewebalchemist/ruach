import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const heading = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const BELIEFS = [
  { title: 'God', text: 'We believe there is one true God, eternally existent in three persons: The Father, Son, and Holy Spirit. These three are co-equal and co-eternal, which is the Trinity.', ref: 'Genesis 1:1-3; Deuteronomy 6:4; Matthew 3:16-17; John 1:1-3' },
  { title: 'The Word of God', text: 'The Holy Bible, and only the Bible, is the authoritative Word of God. It alone is the final authority in determining all doctrinal truths. In its original writing, it is inspired, infallible and inerrant.', ref: '2 Timothy 3:16; 2 Peter 1:20-21' },
  { title: 'Incarnation', text: 'We believe in the deity of our Lord Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His vicarious and atoning death, in His bodily resurrection, and in His personal future return.', ref: '' },
  { title: 'The Gospel', text: 'We believe that Jesus is the Messiah, the Son of the Living God and that He was crucified on a cross for our sins and that He was raised from the dead three days later.', ref: '1 Corinthians 15:1-8' },
  { title: 'Salvation', text: 'We believe in the fall and sinfulness of man and that the only means of being cleansed from sin is through repentance and faith in the redeeming blood of Christ.', ref: '' },
  { title: 'The Holy Spirit', text: 'We believe that all who believe the Gospel are born again by the Holy Spirit and become children of God and heirs of eternal life.', ref: '' },
  { title: 'The Church', text: 'We believe in the universal church, a living spiritual body of which Christ is the head and all regenerated persons are members.', ref: '' },
  { title: 'Marriage', text: 'We believe that God created marriage as a lifelong, exclusive covenant between one man and one woman, reflecting the relationship between Christ and His Church.', ref: '' },
];


function BeliefItem({ title, text, ref: reference }: { title: string; text: string; ref: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-bold text-white text-sm" style={heading}>{title}</span>
        <ChevronDown className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-white/[0.03]">
          <p className="text-[#8B95A8] text-sm leading-relaxed">{text}</p>
          {reference && <p className="text-[#BF0A30] text-xs mt-3 font-medium">{reference}</p>}
        </div>
      )}
    </div>
  );
}

export default function WhoWeArePage() {
  return (
    <Layout title="Who We Are" description="Learn about Ruach Tabernacle's mission, vision, core values, beliefs, and the story of how we started.">

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden bg-[#0A0C10]">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'url(/church-photos/dark-backround.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <img src="/church-photos/rhema-feast.jpg" alt="Ruach Tabernacle" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/40 to-[#0A0C10]/10" />
        </div>
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
          <span className="text-[120px] md:text-[180px] italic text-white/5 whitespace-nowrap leading-none select-none" style={heading}>
            Who We Are. &nbsp; Who We Are.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={heading}>Who We Are</p>
          <h1 className="text-5xl md:text-7xl text-white tracking-tight mb-4" style={heading}>Who We Are.</h1>
          <p className="text-[#8B95A8] text-lg max-w-xl font-medium">God-focused. Service-oriented. Community-driven.</p>
        </div>
      </section>

      {/* THREE PURSUITS */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={heading}>Know Our Pursuits</p>
          <h2 className="text-3xl md:text-4xl text-[#111827] mb-10" style={heading}>As a church, these are the three ways<br className="hidden md:block" /> we intend to live out our mission.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { label: 'God:', text: 'We pursue the presence of God through individual and communal spiritual practices.' },
              { label: 'Work:', text: 'We pursue the spiritual, social, and cultural flourishing of our city.' },
              { label: 'Community:', text: 'We pursue the unity of the church family across racial, political, generational, and economic divides.' },
            ].map((p) => (
              <div key={p.label} className="bg-[#000000] rounded-2xl p-8">
                <p className="text-[#BF0A30] text-xl mb-3 font-black" style={heading}>{p.label}</p>
                <p className="text-[#8B95A8] text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATEMENT OF BELIEF + VISION/MISSION */}
      <section className="bg-[#0A0C10] py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={heading}>Our Statement of Belief</p>
            <div
              className="rounded-2xl p-8"
              style={{ background: 'rgba(191,10,48,0.08)', border: '1px solid rgba(191,10,48,0.15)' }}
            >
              <p className="text-white font-semibold leading-relaxed text-sm italic">
                &ldquo;I am a winner and not a loser.<br />
                I am a victor and not a victim.<br />
                I have changed my mind and my attitude<br />
                to reflect what God says about me.<br />
                My faith is built on God&apos;s word.<br />
                I can do ALL that God says I can do.<br />
                Nothing is impossible from this moment on.<br />
                For I am a new breed, a new kind, a remnant<br />
                and I am after my purpose.&rdquo;
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-2" style={heading}>Our Vision</p>
              <p className="text-[#8B95A8] leading-relaxed">To Effectively Administer the Word of God and Spread it through Innovative Channels; Taking Care of People&apos;s Welfare and Glorifying God through Excellence.</p>
            </div>
            <div className="border-t border-white/8 pt-6">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-2" style={heading}>Our Mission</p>
              <p className="text-[#8B95A8] leading-relaxed">To Raise an Empowered Body of Christ that Fulfills Her Kingdom Mandate while Reflecting God&apos;s Glory to the Nations.</p>
            </div>
            <div className="border-t border-white/8 pt-6">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-2" style={heading}>Our Core Values</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Relevant', 'Significant', 'Timely', 'Focused', 'Dependable'].map((v) => (
                  <span key={v} className="bg-[rgba(191,10,48,0.15)] text-[#F87171] border border-[rgba(191,10,48,0.2)] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg" style={heading}>{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section
        className="relative py-16"
        style={{
          backgroundImage: 'url(/church-photos/dark-background-2.png)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0A0C10]/88" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={heading}>Our Story</p>
          <h2 className="text-4xl md:text-5xl text-white mb-12" style={heading}>How It All Began</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'How It Started', text: 'Ruach Tabernacle met as a congregation in 2022 at KICC, then to Kempinski, before relocating to the current space at Windsor.' },
              { label: "How We've Grown", text: "Started as a congregation of about 200 people, we have grown to more than 3,000 people — and we're still growing." },
              { label: "Where We're Going", text: "We've sent hundreds to proclaim the gospel throughout the nations, trained thousands to live out their faith in their workplace and at home, and fed many people through our care arm. And we're not done yet." },
            ].map((s, i) => (
              <div key={s.label} className="bg-[#111827] rounded-2xl p-7">
                <div className="w-10 h-10 rounded-full bg-[#BF0A30] text-white flex items-center justify-center font-black text-sm flex-shrink-0 mb-4" style={heading}>{i + 1}</div>
                <p className="text-white font-bold mb-3" style={heading}>{s.label}</p>
                <p className="text-[#8B95A8] text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          {/* Story photos grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['/church-photos/rhema-feast.jpg', '/church-photos/aug-2025-a.jpg', '/church-photos/advancing-kingdom.jpg', '/church-photos/june-2025.jpg'].map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={src} alt={`Story ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE BELIEVE — Marquee */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_35s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`a${i}`} className="text-6xl md:text-8xl italic text-white/10 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>What We Believe.</span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-16 animate-[marquee_35s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`b${i}`} className="text-6xl md:text-8xl italic text-white/10 tracking-tight flex-shrink-0 whitespace-nowrap" style={heading}>What We Believe.</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="text-center mb-12">
            <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3" style={heading}>What We Believe</p>
            <h2 className="text-4xl md:text-5xl text-white mb-4" style={heading}>Essential Beliefs</h2>
            <p className="text-[#8B95A8] max-w-xl mx-auto text-sm">
              In essential beliefs, we uphold unity. In non-essential beliefs, we practice liberty. In all our beliefs, we show love.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {BELIEFS.map((b) => <BeliefItem key={b.title} {...b} />)}
          </div>
        </div>
      </section>

      {/* WELCOME FROM LEADERSHIP */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 space-y-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={heading}>A Welcome Message from our Founder and Overseer</p>
              <blockquote className="text-[#374151] leading-relaxed mb-5 italic text-base">
                &ldquo;Originally established as The Purpose Centre Church in 2007 by Rev. Julian Kyula, The Ruach Assemblies is a growing network of church plants across various locations, passionate about transforming lives by empowering individuals to live out their God-given purpose and make a lasting impact in their generation.&rdquo;
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
                &ldquo;RUACH is an acronym for Rhema United Assemblies of Christ. The RUACH Assemblies carry a God-given mandate: Raising Kingdom Champions — men and women who are intentional about pursuing their divine purpose in every sphere of influence, whether in ministry or the marketplace.&rdquo;
              </blockquote>
              <p className="text-[#BF0A30] font-bold text-sm" style={heading}>— Pst. Zino</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8 lg:px-16">
          <h2 className="text-4xl md:text-5xl text-white mb-5" style={heading}>Attend an event.</h2>
          <p className="text-red-100 mb-8">Check out some of our upcoming events on the calendar.</p>
          <Link href="/r-events" className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-xl transition-all" style={heading}>Events Calendar <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </section>

      <ExpectGallery />

    </Layout>
  );
}
