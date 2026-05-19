import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Clock } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const EVENTS = [
  {
    title: '7 Days of Glory',
    dates: '25 – 31 May 2026',
    time: '5:00 PM – 8:00 PM',
    location: 'Rhema Grounds, Along Northern Bypass, next to Shell Windsor, Nairobi',
    description: 'Seven evenings of worship, prayer, revival, and divine encounters. Seven nights. Countless testimonies. One God.',
    href: '/new-here',
    image: '/events/7-days-of-glory.jpg',
  },
];

export default function REventsPage() {
  return (
    <Layout title="Events — Ruach Tabernacle" description="Upcoming events at Ruach Tabernacle — gatherings designed to encounter God, build community, and see lives transformed.">

      <section className="relative min-h-[55vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[600px] h-[600px] bg-[#BF0A30]"
          style={{ top: '0%', right: '0%', filter: 'blur(150px)', opacity: 0.10, ['--spirit-dur' as string]: '11s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>What&apos;s Coming</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-4" style={H}>Events</h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Moments designed by God. Made for you.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-10" style={H}>Upcoming Events</p>
          <div className="grid md:grid-cols-2 gap-8">
            {EVENTS.map((event) => (
              <div key={event.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E5E0D5]">
                <div className="aspect-[16/7] overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl text-[#111827] mb-4" style={H}>{event.title}</h2>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                      <CalendarDays className="w-4 h-4 text-[#BF0A30] flex-shrink-0" />
                      <span>{event.dates}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                      <Clock className="w-4 h-4 text-[#BF0A30] flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <MapPin className="w-4 h-4 text-[#BF0A30] flex-shrink-0 mt-0.5" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-[#374151] leading-relaxed mb-6 text-sm">{event.description}</p>
                  <Link href={event.href} className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-[#9A0826] transition-colors" style={H}>
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
}
