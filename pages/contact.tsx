import Link from 'next/link';
import { MapPin, Clock, Phone, Mail, ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

export default function ContactPage() {
  return (
    <Layout
      title="Contact Us"
      description="Get in touch with Ruach Tabernacle Assembly. We're along the Northern Bypass, next to Shell Windsor, Nairobi."
    >
      <section className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(191,10,48,0.08)] via-transparent to-transparent" />
        <div className="container mx-auto px-6 max-w-7xl relative">
          <p className="text-[#BF0A30] text-sm font-semibold uppercase tracking-widest mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-[#8B95A8] text-xl max-w-xl">
            Whether you&apos;re planning your first visit or want to connect with our team — reach out.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Info */}
            <div className="space-y-6">
              {[
                {
                  icon: <MapPin className="w-5 h-5 text-[#BF0A30]" />,
                  title: 'Location',
                  lines: ['Along the Northern Bypass', 'Next to Shell Windsor', 'Nairobi, Kenya'],
                },
                {
                  icon: <Clock className="w-5 h-5 text-[#BF0A30]" />,
                  title: 'Service Times',
                  lines: ['Sunday Services', 'Check social media for exact times'],
                },
                {
                  icon: <Mail className="w-5 h-5 text-[#BF0A30]" />,
                  title: 'Email',
                  lines: ['info@ruachtabernacle.org'],
                },
              ].map((item) => (
                <div key={item.title} className="glass-card p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(191,10,48,0.15)] flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    {item.lines.map((l, i) => (
                      <p key={i} className="text-[#8B95A8] text-sm">{l}</p>
                    ))}
                  </div>
                </div>
              ))}

              <div className="glass-brand rounded-2xl p-6">
                <h3 className="text-white font-bold mb-2">Planning Your First Visit?</h3>
                <p className="text-[#8B95A8] text-sm leading-relaxed mb-4">
                  Come as you are. Our services are welcoming, about an hour long, and filled with powerful worship and practical teaching.
                </p>
                <Link href="/about" className="btn btn-primary btn-sm flex items-center gap-1.5 self-start">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Map embed placeholder */}
            <div className="glass-card rounded-3xl overflow-hidden h-96 flex items-center justify-center">
              <div className="text-center text-[#4A5568]">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-[#BF0A30]" />
                <p className="font-medium text-[#8B95A8]">Northern Bypass, Windsor</p>
                <p className="text-sm">Nairobi, Kenya</p>
                <a
                  href="https://maps.google.com/?q=Northern+Bypass+Windsor+Nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm mt-4 inline-flex"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
