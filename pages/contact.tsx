import Link from 'next/link';
import { MapPin, Clock, Mail, ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const INFO = [
  {
    icon: <MapPin className="w-5 h-5 text-[#BF0A30]" />,
    title: 'Location',
    lines: ['Along the Northern Bypass', 'Next to Shell Windsor', 'Nairobi, Kenya'],
  },
  {
    icon: <Clock className="w-5 h-5 text-[#BF0A30]" />,
    title: 'Service Times',
    lines: ['First: 8:00 – 9:30 AM', 'Second: 10:00 – 12:00 Noon', 'Third: 12:30 – 2:00 PM'],
  },
  {
    icon: <Mail className="w-5 h-5 text-[#BF0A30]" />,
    title: 'Email',
    lines: ['info@ruachtabernacle.org'],
  },
];

export default function ContactPage() {
  return (
    <Layout
      title="Contact Us — Ruach Tabernacle"
      description="Get in touch with Ruach Tabernacle Assembly. We're along the Northern Bypass, next to Shell Windsor, Nairobi."
    >

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'url(/church-photos/dark-backround.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/40 to-[#0A0C10]/10" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '0%', right: '5%', filter: 'blur(150px)', opacity: 0.10, ['--spirit-dur' as string]: '11s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>Get In Touch</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight tracking-tight mb-5" style={H}>
            We&apos;d Love to<br /><span style={serif}>Hear From You</span>
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-md">
            Planning your first visit or want to connect with our team — reach out.
          </p>
        </div>
      </section>

      {/* ── CONTACT CARDS + MAP ───────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Info cards */}
            <div className="space-y-4">
              {INFO.map((item) => (
                <div key={item.title} className="bg-[#000000] rounded-2xl p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(191,10,48,0.15)] border border-[rgba(191,10,48,0.2)] flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm mb-1" style={H}>{item.title}</h3>
                    {item.lines.map((l, i) => (
                      <p key={i} className="text-[#8B95A8] text-sm">{l}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* New here card */}
              <div
                className="rounded-2xl p-7"
                style={{ background: 'rgba(191,10,48,0.08)', border: '1px solid rgba(191,10,48,0.15)' }}
              >
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-2" style={H}>Planning Your First Visit?</p>
                <h3 className="text-white font-black text-lg mb-2" style={H}>Come as You Are</h3>
                <p className="text-[#8B95A8] text-sm leading-relaxed mb-5">
                  Our services are welcoming, about an hour long, and filled with powerful worship and practical teaching. We won&apos;t single you out.
                </p>
                <Link
                  href="/new-here"
                  className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all"
                  style={H}
                >
                  Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Map */}
            <div className="bg-[#000000] rounded-2xl overflow-hidden min-h-[400px] flex flex-col">
              <div className="flex-1 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.757406097!2d36.8453!3d-1.2147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3df45daed397%3A0xf4b86ad49e78ca05!2sRuach%20Tabernacle%20Assembly!5e0!3m2!1sen!2ske!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '320px', display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale opacity-80"
                />
              </div>
              <div className="p-6 border-t border-white/5">
                <p className="text-white font-black text-sm mb-1" style={H}>Rhema Grounds, Rhema Ave</p>
                <p className="text-[#8B95A8] text-xs mb-4">Off Northern Bypass · Next to Shell Windsor · Nairobi</p>
                <a
                  href="https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-[#BF0A30] text-[#BF0A30] hover:bg-[#BF0A30] hover:text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                  style={H}
                >
                  <MapPin className="w-3.5 h-3.5" /> Get Directions
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </Layout>
  );
}
