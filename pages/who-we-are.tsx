import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ArrowRight, Copy, Check } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import ExpectGallery from '@/components/shared/ExpectGallery';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const STATEMENT_TEXT = `I am a winner and not a loser.
I am a victor and not a victim.
I have changed my mind and my attitude to reflect what God says about me.
My faith is built on God's word.
I can do ALL that God says I can do.
Nothing is impossible from this moment on.
For I am a new breed, a new kind, a remnant and I am after my purpose.`;

const PURSUITS = [
  {
    n: '01',
    label: 'God',
    sub: 'The Supreme Pursuit',
    text: 'We pursue the presence of God through individual and communal spiritual practices — worship, prayer, and the study of His Word.',
  },
  {
    n: '02',
    label: 'Work',
    sub: 'The Second Pursuit',
    text: 'We pursue the spiritual, social, and cultural flourishing of our city — through service, excellence, and kingdom-minded impact.',
  },
  {
    n: '03',
    label: 'Community',
    sub: 'The Third Pursuit',
    text: 'We pursue the unity of the church family across racial, political, generational, and economic divides.',
  },
];

const TIMELINE = [
  {
    year: '2007',
    title: 'The Beginning',
    text: 'Rev. Julian Kyula founded The Purpose Centre Church with a singular vision: to raise people who live out their God-given purpose in every sphere of life.',
  },
  {
    year: '2015',
    title: 'The Ruach Assemblies',
    text: 'The ministry expanded into a growing network of church plants — now known as The Ruach Assemblies — spanning multiple locations across Nairobi.',
  },
  {
    year: '2022',
    title: 'Ruach Tabernacle',
    text: 'Ruach Tabernacle was born. We met first at KICC, then Kempinski Hotel, before finding our permanent home at Rhema Grounds, Windsor, Nairobi.',
  },
  {
    year: 'Today',
    title: 'Growing & Multiplying',
    text: 'From a gathering of 200 to 3,000+ every Sunday — across three services. Still planting, still sending, still growing.',
  },
];

const BELIEFS: { title: string; text: string; scripture: string }[] = [
  {
    title: 'God',
    text: 'We believe there is one true God, eternally existent in three persons: The Father, Son, and Holy Spirit. These three are co-equal and co-eternal, which is the Trinity.',
    scripture: 'Genesis 1:1-3; Deuteronomy 6:4; Matthew 3:16-17; John 1:1-3',
  },
  {
    title: 'The Word of God',
    text: 'The Holy Bible, and only the Bible, is the authoritative Word of God. It alone is the final authority in determining all doctrinal truths. In its original writing, it is inspired, infallible and inerrant.',
    scripture: '2 Timothy 3:16; 2 Peter 1:20-21',
  },
  {
    title: 'Incarnation',
    text: 'We believe in the deity of our Lord Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His vicarious and atoning death, in His bodily resurrection, and in His personal future return.',
    scripture: '',
  },
  {
    title: 'The Gospel',
    text: 'We believe that Jesus is the Messiah, the Son of the Living God and that He was crucified on a cross for our sins and that He was raised from the dead three days later.',
    scripture: '1 Corinthians 15:1-8',
  },
  {
    title: 'Salvation',
    text: "We believe in the fall and sinfulness of man and that the only means of being cleansed from sin is through repentance and faith in the redeeming blood of Christ.",
    scripture: '',
  },
  {
    title: 'The Holy Spirit',
    text: 'We believe that all who believe the Gospel are born again by the Holy Spirit and become children of God and heirs of eternal life.',
    scripture: '',
  },
  {
    title: 'The Church',
    text: 'We believe in the universal church, a living spiritual body of which Christ is the head and all regenerated persons are members.',
    scripture: '',
  },
  {
    title: 'Marriage',
    text: 'We believe that God created marriage as a lifelong, exclusive covenant between one man and one woman, reflecting the relationship between Christ and His Church.',
    scripture: '',
  },
  {
    title: 'Man',
    text: "We believe humans were created in the image of God and placed in a sinless paradise to have fellowship with Him. But because of disobedience to God's Word sin entered the world and fellowship with God was broken; and relationship between humans became strained. Humans through their own efforts cannot restore this brokenness.",
    scripture: 'Genesis 1:26-27, 31; 3:1-8; 11:1-9; Romans 3:9-10, 23; 5:12-14; Ephesians 2:13',
  },
  {
    title: 'The Blessed Hope',
    text: "We believe in the blessed hope, the imminent return of Christ for overcoming believers. We believe that Jesus Christ will physically return to set up His Kingdom. This will occur at a time no one knows except the Father. At His return the resurrection of Christ-Followers and non-Christ-Followers will take place. Heaven will be the eternal dwelling place for all Believers in the Gospel of Jesus Christ. The devil, who is working in the world to destroy the souls of people, along with all his angels, and all whose names are not written in the Book of Life, will eternally perish in the lake of fire, which is Hell.",
    scripture: 'Matthew 4:1-11; 5:3, 12; 6:20; 24:30; 25:34, 41; Mark 9:43-48; John 8:24, 44; Acts 1:9-11; Hebrews 9:27; Revelation 14:9-11; 20:1-15; 21-22',
  },
  {
    title: 'The Christian Life',
    text: "We believe in the ongoing process of spiritual growth of the Christian through the Holy Spirit and God's Word. Each person is to grow in their knowledge of God's Word and in developing and employing their spiritual gifts through the Church so others may come to know Christ and the Church be built up into maturity.",
    scripture: 'John 8:31-32; 14:16-17; 16:13; 17:17; Romans 12:4-8; 1 Corinthians 12-14; Galatians 5:22-23; 2 Timothy 3:16-17; Hebrews 5:11-14',
  },
  {
    title: 'Ordinances',
    text: "We practice two ordinances: (1) Water Baptism by immersion after repenting of one's sins and receiving the gift of salvation. And (2) Holy Communion (the Lord's Supper) as a symbolic remembrance of Christ's suffering and death for our salvation. We also practice baby dedication. Baby dedication is not a guarantee of salvation but a parental commitment to raise the child in a godly way.",
    scripture: '',
  },
];

function BeliefItem({
  title, text, scripture, isOpen, onToggle,
}: {
  title: string; text: string; scripture: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/5 hover:bg-white/10 transition-colors"
        onClick={onToggle}
      >
        <span className="font-bold text-white text-sm" style={H}>{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-3 bg-white/[0.03]">
          <p className="text-[#8B95A8] text-sm leading-relaxed">{text}</p>
          {scripture && (
            <p className="text-[#BF0A30] text-xs mt-3 font-medium leading-relaxed">{scripture}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function WhoWeArePage() {
  const [openBelief, setOpenBelief] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(STATEMENT_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Layout
      title="Who We Are"
      description="Learn about Ruach Tabernacle's mission, vision, core values, beliefs, and the story of how we started."
    >

      {/* ══════════════════════════════════════════════
          HERO — single image, no dark-backround
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex items-end overflow-hidden bg-[#0A0C10]">
        <div className="absolute inset-0">
          <img
            src="/church-photos/rhema-feast.jpg"
            alt="Ruach Tabernacle"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/45 to-[#0A0C10]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
          <span className="text-[120px] md:text-[180px] italic text-white/5 whitespace-nowrap leading-none" style={H}>
            Who We Are. &nbsp; Who We Are.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-36 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-5" style={H}>Who We Are</p>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white tracking-tight mb-6 leading-[1.05]" style={H}>
            God-focused.<br />
            <span style={serif}>Service-oriented.</span><br />
            Community-driven.
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-xl leading-relaxed">
            We are Ruach Tabernacle — a church built on the Word of God, empowered by the Holy Spirit,
            and called to transform lives across Nairobi and beyond.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE — dark, same style as New Here page
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`a${i}`} className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight" style={H}>
                <span className="text-[#BF0A30]" style={serif}>God</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">Work</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Community</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={`b${i}`} className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight" style={H}>
                <span className="text-[#BF0A30]" style={serif}>God</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-white/80">Work</span>
                <span className="text-white/20 text-lg">·</span>
                <span className="text-[#BF0A30]" style={serif}>Community</span>
                <span className="text-white/10 text-lg">—</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          THREE PURSUITS — staircase layout
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
            Know Our Pursuits
          </p>
          <h2 className="text-4xl md:text-5xl text-[#111827] mb-14 leading-tight" style={H}>
            As a church, these are the three<br className="hidden md:block" />
            ways we live out our mission.
          </h2>

          <div className="space-y-3">
            {PURSUITS.map((p, i) => (
              <div
                key={p.label}
                className={`rounded-3xl bg-[#000] p-8 md:p-10 flex items-start gap-6 md:gap-8 ${
                  i === 1 ? 'md:ml-16' : i === 2 ? 'md:ml-32' : ''
                }`}
              >
                <div className="flex-shrink-0 pt-1">
                  <span className="text-5xl md:text-6xl font-black leading-none tabular-nums text-[#BF0A30]" style={H}>
                    {p.n}
                  </span>
                </div>
                <div>
                  <p className="text-[#8B95A8] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>
                    {p.sub}
                  </p>
                  <h3 className="text-white text-2xl md:text-3xl font-black mb-3" style={H}>{p.label}</h3>
                  <p className="text-[#8B95A8] text-sm leading-relaxed max-w-lg">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATEMENT OF BELIEF + VISION / MISSION
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-start">

          {/* Statement */}
          <div>
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-6" style={H}>
              Our Statement of Belief
            </p>
            <div
              className="relative rounded-3xl p-8 md:p-10"
              style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '3px solid #BF0A30' }}
            >
              <span
                className="absolute top-4 left-6 text-[72px] leading-none select-none text-[#BF0A30]/30"
                style={{ fontFamily: 'Georgia, serif' }}
                aria-hidden
              >
                &ldquo;
              </span>
              <div className="relative pt-8 space-y-2">
                {STATEMENT_TEXT.split('\n').map((line, i) => (
                  <p key={i} className="text-white text-base leading-loose" style={{ ...serif, fontStyle: 'italic' }}>
                    {line}
                  </p>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className={`mt-8 inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${
                  copied
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10'
                }`}
                style={H}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Statement'}
              </button>
            </div>
          </div>

          {/* Vision / Mission / Values */}
          <div className="space-y-8 pt-2">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Our Vision</p>
              <p className="text-[#D1D5DB] leading-relaxed text-sm">
                To Effectively Administer the Word of God and Spread it through Innovative Channels;
                Taking Care of People&apos;s Welfare and Glorifying God through Excellence.
              </p>
            </div>
            <div className="border-t border-white/10 pt-8">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>Our Mission</p>
              <p className="text-[#D1D5DB] leading-relaxed text-sm">
                To Raise an Empowered Body of Christ that Fulfills Her Kingdom Mandate while Reflecting
                God&apos;s Glory to the Nations.
              </p>
            </div>
            <div className="border-t border-white/10 pt-8">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Our Core Values</p>
              <div className="flex flex-wrap gap-2">
                {['Relevant', 'Significant', 'Timely', 'Focused', 'Dependable'].map((v) => (
                  <span
                    key={v}
                    className="text-[#F87171] border text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl"
                    style={{ ...H, background: 'rgba(191,10,48,0.12)', borderColor: 'rgba(191,10,48,0.2)' }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          OUR STORY — images left, drip timeline right
      ══════════════════════════════════════════════ */}
      <section
        className="relative py-20"
        style={{
          backgroundImage: 'url(/church-photos/dark-background-2.png)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0A0C10]/90" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* Mobile: small image strip */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-10 scrollbar-hide md:hidden">
            {[
              '/church-photos/advancing-kingdom.jpg',
              '/church-photos/aug-2025-a.jpg',
              '/church-photos/rhema-feast.jpg',
            ].map((src, i) => (
              <div key={i} className="flex-shrink-0 w-40 h-28 rounded-xl overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left column: staggered photo collage (desktop only) */}
            <div className="relative hidden md:block" style={{ height: '560px' }}>
              {/* Photo 1 — top left */}
              <div
                className="absolute rounded-2xl overflow-hidden shadow-2xl"
                style={{ top: 0, left: 0, width: '62%', aspectRatio: '4/3', border: '3px solid rgba(255,255,255,0.06)' }}
              >
                <img
                  src="/church-photos/advancing-kingdom.jpg"
                  alt="How it began"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
                />
              </div>
              {/* Photo 2 — mid right (overlaps 1) */}
              <div
                className="absolute rounded-2xl overflow-hidden shadow-2xl"
                style={{ top: '28%', right: 0, width: '55%', aspectRatio: '4/3', border: '3px solid #0A0C10' }}
              >
                <img
                  src="/church-photos/aug-2025-a.jpg"
                  alt="Growing together"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
                />
              </div>
              {/* Photo 3 — bottom left (overlaps 2) */}
              <div
                className="absolute rounded-2xl overflow-hidden shadow-2xl"
                style={{ bottom: 0, left: '8%', width: '52%', aspectRatio: '4/3', border: '3px solid #0A0C10' }}
              >
                <img
                  src="/church-photos/rhema-feast.jpg"
                  alt="Rhema Feast"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }}
                />
              </div>
            </div>

            {/* Right column: header + drip timeline */}
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
                Our Story
              </p>
              <h2 className="text-4xl md:text-5xl text-white mb-12 leading-tight" style={H}>
                How It All<br />
                <span style={serif}>Began</span>
              </h2>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[9px] top-2 bottom-8 w-px bg-gradient-to-b from-[#BF0A30] via-[#BF0A30]/30 to-transparent" />

                <div className="space-y-0">
                  {TIMELINE.map((item, i) => (
                    <div key={item.year} className="relative flex gap-6 pb-10 last:pb-0">
                      {/* Dot */}
                      <div className="flex-shrink-0 flex flex-col items-center pt-1" style={{ width: '20px' }}>
                        <div
                          className="w-[18px] h-[18px] rounded-full bg-[#BF0A30] relative z-10"
                          style={{ boxShadow: '0 0 0 3px rgba(191,10,48,0.2), 0 0 10px rgba(191,10,48,0.35)' }}
                        />
                      </div>

                      {/* Content */}
                      <div
                        className="flex-1 rounded-2xl p-5"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>
                          {item.year}
                        </p>
                        <p className="text-white font-black text-base mb-1.5" style={H}>{item.title}</p>
                        <p className="text-[#8B95A8] text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE — cream stroke, same as New Here
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-6 overflow-hidden border-y border-[#E0D8CE]">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={`a${i}`}
                className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap"
                style={{ ...H, fontStyle: 'italic' }}
              >
                What We Believe.
              </span>
            ))}
          </div>
          <div className="flex-shrink-0 flex items-center gap-10 animate-[marquee_30s_linear_infinite]" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={`b${i}`}
                className="marquee-stroke text-[80px] md:text-[100px] tracking-tight flex-shrink-0 whitespace-nowrap"
                style={{ ...H, fontStyle: 'italic' }}
              >
                What We Believe.
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ESSENTIAL BELIEFS — one open at a time
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0A0C10] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
              What We Believe
            </p>
            <h2 className="text-4xl md:text-5xl text-white mb-4" style={H}>Essential Beliefs</h2>
            <p className="text-[#8B95A8] max-w-xl mx-auto text-sm leading-relaxed">
              In essential beliefs, we uphold unity. In non-essential beliefs, we practice liberty.
              In all our beliefs, we show love.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {BELIEFS.map((b, i) => (
              <BeliefItem
                key={b.title}
                title={b.title}
                text={b.text}
                scripture={b.scripture}
                isOpen={openBelief === i}
                onToggle={() => setOpenBelief(openBelief === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LEADERSHIP — same glassmorphism as New Here
      ══════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden bg-[#0A0C10]">
        <div className="absolute inset-0">
          <img
            src="/church-photos/dark-background-3.png"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[#0A0C10]/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-14">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
              A Word from Our Leaders
            </p>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              Welcome to<br />
              <span style={serif}>the family.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rev. Julian Kyula */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(18,21,28,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/pastors/rev-julian1.jpg"
                  alt="Rev. Julian Kyula"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/brand/rev-julian.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151C]/80 via-transparent to-transparent" />
              </div>
              <div className="p-8">
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>
                  Founder &amp; Overseer
                </p>
                <p className="text-white font-black text-lg mb-5" style={H}>Rev. Julian Kyula</p>
                <blockquote className="text-[#8B95A8] leading-relaxed text-sm" style={{ ...serif, fontStyle: 'italic' }}>
                  &ldquo;Originally established as The Purpose Centre Church in 2007, The Ruach Assemblies
                  is a growing network of church plants passionate about transforming lives — empowering
                  individuals to live out their God-given purpose and make a lasting impact in their
                  generation.&rdquo;
                </blockquote>
              </div>
            </div>

            {/* Pst. Zino */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(18,21,28,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/pastors/pst-zino-portrait.jpg"
                  alt="Pst. Ekelemu Ewomazino"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/pastors/pst-zino.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151C]/80 via-transparent to-transparent" />
              </div>
              <div className="p-8">
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-1" style={H}>
                  Senior Pastor
                </p>
                <p className="text-white font-black text-lg mb-5" style={H}>Pst. Ekelemu Ewomazino</p>
                <blockquote className="text-[#8B95A8] leading-relaxed text-sm" style={{ ...serif, fontStyle: 'italic' }}>
                  &ldquo;RUACH is an acronym for Rhema United Assemblies of Christ. We carry a God-given
                  mandate: Raising Kingdom Champions — men and women who are intentional about pursuing
                  their divine purpose in every sphere of influence, whether in ministry or the
                  marketplace.&rdquo;
                </blockquote>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/our-team"
              className="inline-flex items-center gap-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-all"
              style={H}
            >
              Meet Our Team <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl text-white mb-5" style={H}>
            See you on<br />
            <span style={serif}>Sunday.</span>
          </h2>
          <p className="text-red-100 mb-8 leading-relaxed">
            Check out some of our upcoming events, or plan your first visit with us.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/r-events"
              className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Events Calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/new-here"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <ExpectGallery />

    </Layout>
  );
}
