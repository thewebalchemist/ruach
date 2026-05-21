import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

const EVENTS: {
  title: string;
  dates: string;
  time: string;
  location: string;
  description: string;
  image: string;
  href: string;
}[] = [
  {
    title: '7 Days of Glory',
    dates: '25 – 31 May 2026',
    time: '5:00 PM – 8:00 PM',
    location: 'Rhema Grounds, Along Northern Bypass, next to Shell Windsor, Nairobi',
    description: 'Seven evenings of worship, prayer, revival, and divine encounters. Seven nights. Countless testimonies. One God.',
    image: '/events/7-days-of-glory.jpg',
    href: '/new-here',
  },
];

export default function REventsPage() {
  return (
    <Layout
      title="Events — Ruach Tabernacle"
      description="Upcoming events at Ruach Tabernacle — gatherings designed to encounter God, build community, and see lives transformed."
    >

      {/* HERO */}
      <section className="relative min-h-[65vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/church-photos/rhema-feast.jpg"
            alt="Ruach Tabernacle Events"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>

        {/* Spirit orb */}
        <div
          className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '5%', right: '-5%', filter: 'blur(150px)', opacity: 0.09, ['--spirit-dur' as string]: '11s' }}
        />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
          <span className="text-[110px] md:text-[170px] italic text-white/5 whitespace-nowrap leading-none" style={H}>
            Events. &nbsp; Events. &nbsp; Events.
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-36 w-full">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white border border-white/15 bg-white/5 mb-6"
            style={H}
          >
            What&apos;s Coming
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-[1.05] tracking-tight mb-5" style={H}>
            Events
          </h1>
          <p className="text-[#8B95A8] text-lg max-w-md leading-relaxed" style={serif}>
            Moments designed by God. Made for you.
          </p>
        </div>
      </section>

      {/* DARK MARQUEE — Worship · Encounter · Transform */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          {[0, 1].map(t => (
            <div key={t} className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight"
                  style={H}
                >
                  <span className="text-[#BF0A30]" style={serif}>Worship</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-white/80">Encounter</span>
                  <span className="text-white/20 text-lg">·</span>
                  <span className="text-[#BF0A30]" style={serif}>Transform</span>
                  <span className="text-white/10 text-lg">—</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section className="bg-[#0A0C10] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-12">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full bg-[#BF0A30]/15 text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest border border-[#BF0A30]/20"
              style={H}
            >
              Upcoming
            </span>
            <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
              Upcoming <span style={serif}>Events.</span>
            </h2>
          </div>

          {EVENTS.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-white text-xl mb-2" style={H}>No upcoming events at the moment</p>
              <p className="text-[#8B95A8] text-sm">Check back soon — something is always coming.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {EVENTS.map((event) => (
                <div
                  key={event.title}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="aspect-[16/7] overflow-hidden rounded-2xl mb-5">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }}
                    />
                  </div>
                  <div className="px-7 pb-7">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full bg-[#BF0A30] text-white text-[10px] font-bold uppercase tracking-widest mb-4"
                      style={H}
                    >
                      {event.dates}
                    </span>
                    <h3 className="text-white text-2xl md:text-3xl mb-4 leading-tight" style={H}>
                      {event.title}
                    </h3>
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-3 text-sm text-[#8B95A8]">
                        <CalendarDays className="w-4 h-4 text-[#BF0A30] flex-shrink-0" />
                        <span>{event.dates}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#8B95A8]">
                        <Clock className="w-4 h-4 text-[#BF0A30] flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-[#8B95A8]">
                        <MapPin className="w-4 h-4 text-[#BF0A30] flex-shrink-0 mt-0.5" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <p className="text-[#8B95A8] text-sm leading-relaxed mb-6">{event.description}</p>
                    <Link
                      href={event.href}
                      className="inline-flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-lg shadow-[rgba(191,10,48,0.3)]"
                      style={H}
                    >
                      Learn More <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PAST EVENTS NOTE */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
            More from Ruach
          </p>
          <h2 className="text-3xl md:text-4xl text-[#111827] mb-5 leading-tight" style={H}>
            Catch up on<br />
            <span style={serif}>past messages.</span>
          </h2>
          <p className="text-[#6B7280] leading-relaxed mb-8">
            Missed a service or want to revisit a message? Our full library of sermons and past event recordings is available online — so you can encounter God on your own schedule.
          </p>
          <Link
            href="/sermons"
            className="inline-flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all"
            style={H}
          >
            Watch Sermons <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl text-white mb-4" style={H}>
            Plan your visit.
          </h2>
          <p className="text-red-100 mb-8 leading-relaxed">
            We&apos;d love to see you at one of our events — or any Sunday morning.
          </p>
          <Link
            href="/new-here"
            className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
            style={H}
          >
            Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </Layout>
  );
}
