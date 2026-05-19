import Link from 'next/link';
import { Radio, Heart, Users, Globe, BookOpen, ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const BELIEFS = [
  {
    title: 'The Gospel',
    text: 'We believe that Jesus is the Messiah, the Son of the Living God — that He was crucified for our sins and raised from the dead. This is the foundation of everything we are.',
    ref: 'Matthew 16:16 · 1 Corinthians 15:1-8',
  },
  {
    title: 'Salvation',
    text: 'We believe in the fall and sinfulness of man and that the only means of being cleansed from sin is through repentance and faith in the redeeming blood of Christ.',
    ref: '',
  },
  {
    title: 'New Birth',
    text: 'We believe that all who believe the Gospel are born again by the Holy Spirit and become children of God and heirs of eternal life.',
    ref: '',
  },
];

const VALUES = [
  {
    icon: <Globe className="w-5 h-5 text-[#BF0A30]" />,
    title: 'Presence',
    desc: 'We pursue the presence of God through individual and communal spiritual practices.',
  },
  {
    icon: <Heart className="w-5 h-5 text-[#BF0A30]" />,
    title: 'City',
    desc: 'We pursue the spiritual, social, and cultural flourishing of Nairobi and beyond.',
  },
  {
    icon: <Users className="w-5 h-5 text-[#BF0A30]" />,
    title: 'Unity',
    desc: 'We pursue unity across racial, political, generational, and economic divides.',
  },
];

export default function AboutPage() {
  return (
    <Layout
      title="Who We Are"
      description="Ruach Tabernacle Assembly — We are a community of believers passionate about Jesus Christ, rooted in the Word of God, and empowered by the Holy Spirit. Nairobi, Kenya."
    >
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(191,10,48,0.12)] via-transparent to-transparent" />
        <div className="container mx-auto px-6 max-w-7xl relative">
          <p className="text-[#BF0A30] text-sm font-semibold uppercase tracking-widest mb-4 animate-fade-in-up">Who We Are</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100 max-w-3xl">
            You&apos;re Family.
          </h1>
          <p className="text-[#8B95A8] text-xl leading-relaxed max-w-2xl animate-fade-in-up delay-200">
            We are a community of believers passionate about Jesus Christ, rooted in the Word of God,
            and empowered by the Holy Spirit.
          </p>
        </div>
      </section>

      {/* ─── AFFIRMATION ─────────────────────────────────────── */}
      <section className="py-16 border-t border-white/6">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <blockquote className="glass-brand rounded-3xl px-10 py-12">
            <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed italic">
              &ldquo;I am a winner and not a loser.<br />
              I am a victor and not a victim.<br />
              I have changed my mind and my attitude to reflect what God says about me.<br />
              My faith is built on God&apos;s Word.<br />
              Nothing is impossible from this moment on.&rdquo;
            </p>
            <p className="text-[#BF0A30] mt-6 font-semibold text-sm uppercase tracking-widest">
              Ruach Tabernacle Confession
            </p>
          </blockquote>
        </div>
      </section>

      {/* ─── MISSION ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#BF0A30] text-sm font-semibold uppercase tracking-widest mb-4">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6">
                To Raise Kingdom Champions
              </h2>
              <p className="text-[#8B95A8] text-lg leading-relaxed mb-8">
                Our mission is to effectively administer the Word of God and spread it through innovative channels —
                taking care of people&apos;s welfare and glorifying God through excellence.
              </p>
              <p className="text-[#8B95A8] leading-relaxed mb-8">
                We are raising an empowered body of Christ that fulfills her Kingdom mandate while reflecting
                God&apos;s glory to the nations. Kingdom Champions are people who are deliberate about pursuing
                their God-given purposes — in ministry and in the marketplace.
              </p>
              <Link href="/connect" className="btn btn-primary self-start flex items-center gap-2">
                Join Connect Class <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {VALUES.map((v, i) => (
                <div
                  key={v.title}
                  className="glass-card p-6 flex gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[rgba(191,10,48,0.15)] flex items-center justify-center flex-shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{v.title}</h3>
                    <p className="text-[#8B95A8] text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE BELIEVE ──────────────────────────────────── */}
      <section className="py-24 border-t border-white/6">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-14">
            <p className="text-[#BF0A30] text-sm font-semibold uppercase tracking-widest mb-3">Our Faith</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">What We Believe</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {BELIEFS.map((b, i) => (
              <div
                key={b.title}
                className="glass-card p-8 animate-fade-in-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center mb-5">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{b.title}</h3>
                <p className="text-[#8B95A8] leading-relaxed text-sm mb-3">{b.text}</p>
                {b.ref && (
                  <p className="text-[#4A5568] text-xs font-medium">{b.ref}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RT KIDS ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="glass-card rounded-3xl p-10 md:p-14">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[#BF0A30] text-sm font-semibold uppercase tracking-widest mb-3">For Families</p>
                <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">RT Kids</h2>
                <p className="text-[#8B95A8] leading-relaxed mb-4">
                  We know that your children are a big priority. We are committed to making sure that your
                  first visit is enjoyable and stress-free.
                </p>
                <p className="text-[#8B95A8] leading-relaxed mb-6">
                  RT Kids creates a safe, fun, and engaging environment for children through games, interactive
                  Bible lessons, and creative crafts. All our volunteers undergo background checks and receive
                  comprehensive training in child safety and protection.
                </p>
                <Link href="/contact" className="btn btn-secondary btn-sm flex items-center gap-1.5 self-start">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[rgba(191,10,48,0.2)] to-[rgba(191,10,48,0.05)] border border-[rgba(191,10,48,0.2)] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl mb-2">🙌</p>
                    <p className="text-white font-bold">RT Kids</p>
                    <p className="text-[#8B95A8] text-sm">Every Sunday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/6 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <Radio className="w-12 h-12 text-[#BF0A30] mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
            Come as You Are
          </h2>
          <p className="text-[#8B95A8] text-lg leading-relaxed mb-8">
            We welcome you. Whether you prefer to dress up or dress down — come as you are.
            Your seat is ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/live" className="btn btn-primary btn-lg">
              <Radio className="w-5 h-5" /> Watch Online
            </Link>
            <Link href="/contact" className="btn btn-secondary btn-lg">
              Get Directions
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
