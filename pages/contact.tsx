import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, Mail, Phone, ArrowRight, ExternalLink } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const LOCATIONS = [
  {
    badge: 'Flagship HQ',
    name: 'Ruach Tabernacle',
    address: 'Rhema Grounds, Rhema Ave',
    sub: 'Off Northern Bypass · Next to Shell Windsor',
    times: '8AM · 10AM · 12:30PM',
    mapsUrl: 'https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z',
    featured: true,
  },
  {
    badge: '02',
    name: 'Ruach West',
    address: 'Mövenpick Hotel, Westlands',
    sub: 'Westlands, Nairobi',
    times: 'Sundays · 10AM',
    mapsUrl: 'https://maps.google.com/?q=Movenpick+Hotel+Nairobi+Westlands',
    featured: false,
  },
  {
    badge: '03',
    name: 'Ruach East',
    address: 'ICD Road, off Mombasa Road',
    sub: 'Next to Ideal Ceramics',
    times: 'Sundays · 10AM',
    mapsUrl: 'https://maps.google.com/?q=ICD+Road+Mombasa+Road+Nairobi',
    featured: false,
  },
  {
    badge: '04',
    name: 'Ruach South',
    address: 'Waterfront Mall, Karen',
    sub: 'Karen, Nairobi',
    times: 'Sundays · 10AM',
    mapsUrl: 'https://maps.google.com/?q=Waterfront+Mall+Karen+Nairobi',
    featured: false,
  },
  {
    badge: '05',
    name: 'Ruach Rivers',
    address: 'Havilah Ranch',
    sub: 'Northern Bypass, Nairobi',
    times: 'Sundays · 10AM',
    mapsUrl: 'https://maps.google.com/?q=Havilah+Ranch+Northern+Bypass+Nairobi',
    featured: false,
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Layout
      title="Contact Us"
      description="Get in touch with Ruach Tabernacle Assembly. We're along the Northern Bypass, next to Shell Windsor, Nairobi."
    >

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[62vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/june-2025.jpg"
            alt="Contact Ruach Tabernacle"
            className="w-full h-full object-cover opacity-35"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>
        {/* Spirit orb */}
        <div
          className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '5%', right: '-5%', filter: 'blur(150px)', opacity: 0.09, ['--spirit-dur' as string]: '13s' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-20 pt-32 w-full">
          <div
            className="inline-flex items-center gap-2 text-[#F87171] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(191,10,48,0.18)', border: '1px solid rgba(191,10,48,0.30)' }}
          >
            <span style={H}>Get In Touch</span>
          </div>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-tight tracking-tight mb-5" style={H}>
            We&apos;d Love to<br /><span style={serif}>Hear From You</span>
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-md leading-relaxed">
            Planning a visit or want to connect with our team — we&apos;re here for you.
          </p>
        </div>
      </section>

      {/* ── DARK MARQUEE ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-4 border-y"
        style={{ background: '#0A0C10', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex whitespace-nowrap animate-[marquee_32s_linear_infinite]">
          {[...Array(2)].map((_, t) => (
            <div key={t} className="flex items-center">
              {['Visit', 'Connect', 'Worship', 'Belong', 'Gather', 'Be Known'].map((word, i) => (
                <span key={i} className="flex items-center">
                  <span
                    className="text-[13px] uppercase tracking-[0.2em] px-6"
                    style={{ ...H, color: i % 3 === 0 ? '#BF0A30' : i % 3 === 1 ? 'white' : '#BF0A30', fontStyle: i % 3 === 1 ? 'italic' : 'normal', fontFamily: i % 3 === 1 ? '"Playfair Display", Georgia, serif' : undefined }}
                  >
                    {word}
                  </span>
                  <span className="text-[#BF0A30] text-xs opacity-60">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK INFO STRIP ──────────────────────────────────────── */}
      <section className="bg-[#0A0C10] pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Clock className="w-5 h-5 text-[#BF0A30]" />,
                label: 'Service Times',
                main: '8AM · 10AM · 12:30PM',
                sub: 'Every Sunday',
              },
              {
                icon: <MapPin className="w-5 h-5 text-[#BF0A30]" />,
                label: 'Our Location',
                main: 'Rhema Grounds',
                sub: 'Northern Bypass, next to Shell Windsor',
              },
              {
                icon: <Mail className="w-5 h-5 text-[#BF0A30]" />,
                label: 'Email Us',
                main: 'info@ruachtabernacle.org',
                sub: 'We respond within 24 hours',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="flex items-start gap-4 rounded-2xl px-6 py-5"
                style={{
                  background: 'rgba(18,21,28,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(191,10,48,0.12)', border: '1px solid rgba(191,10,48,0.20)' }}
                >
                  {card.icon}
                </div>
                <div>
                  <p className="text-[#BF0A30] text-[9px] font-bold uppercase tracking-widest mb-1" style={H}>
                    {card.label}
                  </p>
                  <p className="text-white text-sm font-bold leading-snug" style={H}>{card.main}</p>
                  <p className="text-[#8B95A8] text-xs mt-0.5 leading-relaxed">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP + FORM ────────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Map */}
            <div
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(18,21,28,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                minHeight: '460px',
              }}
            >
              <div className="flex-1 relative min-h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.757406097!2d36.8453!3d-1.2147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3df45daed397%3A0xf4b86ad49e78ca05!2sRuach%20Tabernacle%20Assembly!5e0!3m2!1sen!2ske!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '300px', display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale opacity-75"
                />
              </div>
              <div className="px-7 py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white font-black text-sm mb-0.5" style={H}>Ruach Tabernacle — Flagship HQ</p>
                <p className="text-[#8B95A8] text-xs mb-5 leading-relaxed">
                  Rhema Grounds, Rhema Ave · Off Northern Bypass · Next to Shell Windsor · Nairobi
                </p>
                <a
                  href="https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white font-black text-[11px] uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all hover:bg-[#9A0826]"
                  style={{ background: '#BF0A30', ...H }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Get Directions
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div
              className="rounded-3xl p-8 flex flex-col"
              style={{
                background: 'rgba(18,21,28,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
                Send a Message
              </p>
              <h2 className="text-3xl text-white mb-2 leading-tight" style={H}>
                Reach Out<br /><span style={serif}>to Our Team</span>
              </h2>
              <p className="text-[#8B95A8] text-sm mb-8 leading-relaxed">
                Have a question, need prayer, or want to get more involved? We&apos;d love to hear from you.
              </p>

              {sent ? (
                <div
                  className="flex-1 flex flex-col items-center justify-center text-center rounded-2xl py-12 px-8"
                  style={{ background: 'rgba(191,10,48,0.08)', border: '1px solid rgba(191,10,48,0.20)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(191,10,48,0.15)' }}
                  >
                    <span className="text-2xl">🙏</span>
                  </div>
                  <h3 className="text-white font-black text-xl mb-2" style={H}>Message Received!</h3>
                  <p className="text-[#8B95A8] text-sm leading-relaxed">
                    Thank you for reaching out. Someone from our team will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B95A8] mb-2 block" style={H}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B95A8] mb-2 block" style={H}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B95A8] mb-2 block" style={H}>
                      Message
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="How can we help you?"
                      rows={5}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all resize-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl text-white transition-all hover:bg-[#9A0826] active:scale-[0.98]"
                    style={{ background: '#BF0A30', ...H }}
                  >
                    Send Message <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ASSEMBLIES ────────────────────────────────────────────── */}
      <section className="bg-[#0A0C10] py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
                Find Us Near You
              </p>
              <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
                5 Assemblies.<br />
                <span style={serif}>One family.</span>
              </h2>
            </div>
            <p className="text-[#8B95A8] max-w-xs text-sm leading-relaxed">
              We have assemblies across Nairobi so you can worship closer to home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Flagship */}
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
                <p className="text-white font-black text-2xl leading-tight mb-1" style={H}>Ruach Tabernacle</p>
                <p className="text-red-200 text-sm">Rhema Grounds, Northern Bypass</p>
              </div>
              <div className="relative flex items-center justify-between">
                <p className="text-red-200/70 text-xs leading-relaxed">Every Sunday · 8AM · 10AM · 12:30PM</p>
                <a
                  href="https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <MapPin className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Other assemblies */}
            {LOCATIONS.filter(l => !l.featured).map((loc) => (
              <div
                key={loc.name}
                className="rounded-3xl p-7 flex flex-col justify-between min-h-[180px]"
                style={{
                  background: 'rgba(18,21,28,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-3" style={H}>
                    {loc.badge}
                  </p>
                  <p className="text-white font-black text-lg leading-tight mb-1.5" style={H}>{loc.name}</p>
                  <p className="text-[#8B95A8] text-xs leading-relaxed">{loc.address}</p>
                  <p className="text-[#8B95A8] text-xs opacity-60">{loc.sub}</p>
                </div>
                <div className="flex items-center justify-between mt-5">
                  <div className="h-px w-8" style={{ background: 'rgba(191,10,48,0.4)' }} />
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-[#BF0A30]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Ready to visit?</p>
          <h2 className="text-4xl text-white mb-5" style={H}>
            Your seat<br /><span style={serif}>is waiting.</span>
          </h2>
          <p className="text-red-100 text-sm mb-8 leading-relaxed">
            Every Sunday at 8AM, 10AM, and 12:30PM — along the Northern Bypass, next to Shell Windsor.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/new-here"
              className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/all-about-ruach"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Learn More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}
