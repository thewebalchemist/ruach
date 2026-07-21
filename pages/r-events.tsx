import { useState } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { ArrowRight, CalendarDays, Clock, MapPin, LayoutGrid, Calendar } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';

const H     = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

interface Event {
  id:          string;
  title:       string;
  description: string | null;
  event_date:  string;
  end_date:    string | null;
  start_time:  string | null;
  end_time:    string | null;
  location:    string | null;
  map_url:     string | null;
  image_url:   string | null;
  category:    string | null;
  link_url:    string | null;
  link_label:  string | null;
}

// ── Google Calendar URL ────────────────────────────────────────────────────────
function googleCalUrl(ev: Event) {
  const dt = (d: string) => d.replace(/-/g, '');
  const start = dt(ev.event_date);
  const end   = ev.end_date ? dt(ev.end_date) : start;
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     ev.title,
    dates:    `${start}/${end}`,
    details:  ev.description ?? '',
    location: ev.location ?? 'Ruach Tabernacle',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// ── Card view ─────────────────────────────────────────────────────────────────
function EventCard({ ev }: { ev: Event }) {
  const dateLabel = new Date(ev.event_date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {ev.image_url && (
        <div className="aspect-square overflow-hidden">
          <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }} />
        </div>
      )}
      <div className="p-7 flex-1 flex flex-col">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#BF0A30] text-white text-[10px] font-bold uppercase tracking-widest mb-4 w-fit" style={H}>
          {dateLabel}
        </span>
        <h3 className="text-white text-2xl md:text-3xl mb-4 leading-tight flex-1" style={H}>{ev.title}</h3>
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-3 text-sm text-[#8B95A8]">
            <CalendarDays className="w-4 h-4 text-[#BF0A30] flex-shrink-0" />
            <span>{dateLabel}{ev.end_date ? ` – ${new Date(ev.end_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long' })}` : ''}</span>
          </div>
          {ev.start_time && (
            <div className="flex items-center gap-3 text-sm text-[#8B95A8]">
              <Clock className="w-4 h-4 text-[#BF0A30] flex-shrink-0" />
              <span>{ev.start_time}{ev.end_time ? ` – ${ev.end_time}` : ''}</span>
            </div>
          )}
          {ev.location && (
            <div className="flex items-start gap-3 text-sm text-[#8B95A8]">
              <MapPin className="w-4 h-4 text-[#BF0A30] flex-shrink-0 mt-0.5" />
              {ev.map_url ? (
                <a href={ev.map_url} target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-white/20 hover:decoration-white transition-colors">{ev.location}</a>
              ) : (
                <span>{ev.location}</span>
              )}
            </div>
          )}
        </div>
        {ev.description && <p className="text-[#8B95A8] text-sm leading-relaxed mb-6">{ev.description}</p>}
        <div className="flex flex-wrap gap-2 mt-auto">
          {ev.link_url && (
            <a href={ev.link_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#BF0A30] hover:bg-[#9A0826] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]">
              {ev.link_label || 'Register Now'} →
            </a>
          )}
          {ev.map_url && (
            <a href={ev.map_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#BF0A30] text-[#BF0A30] hover:bg-[#BF0A30] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors">
              <MapPin className="w-3.5 h-3.5" /> Get Directions
            </a>
          )}
          <a href={googleCalUrl(ev)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white/70 text-xs font-bold transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Google Calendar
          </a>
          <a href={`/api/events/ics?id=${ev.id}`} download={`${ev.title.replace(/\s+/g, '-')}.ics`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white/70 text-xs font-bold transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Apple Calendar
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Calendar view ─────────────────────────────────────────────────────────────
function CalendarView({ events }: { events: Event[] }) {
  const today  = new Date();
  const [year, setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMo  = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month, 1).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

  const eventsThisMonth = events.filter(ev => {
    const d = new Date(ev.event_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const evByDay: Record<number, Event[]> = {};
  eventsThisMonth.forEach(ev => {
    const d = new Date(ev.event_date).getDate();
    if (!evByDay[d]) evByDay[d] = [];
    evByDay[d].push(ev);
  });

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl overflow-hidden">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}
          className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/60 flex items-center justify-center text-lg transition-colors">
          ‹
        </button>
        <h3 className="text-white font-black" style={H}>{monthName}</h3>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}
          className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/60 flex items-center justify-center text-lg transition-colors">
          ›
        </button>
      </div>
      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-white/[0.07]">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/25" style={H}>{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-16 border-b border-r border-white/[0.04]" />
        ))}
        {Array.from({ length: daysInMo }, (_, i) => i + 1).map(day => {
          const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
          const dayEvs  = evByDay[day] ?? [];
          return (
            <div key={day} className={`h-16 border-b border-r border-white/[0.04] p-1 flex flex-col ${isToday ? 'bg-[#BF0A30]/10' : ''}`}>
              <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#BF0A30] text-white' : 'text-white/40'}`} style={H}>
                {day}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvs.slice(0, 2).map(ev => (
                  <span key={ev.id} className="text-[9px] font-bold bg-[#BF0A30]/20 text-[#BF0A30] rounded px-1 truncate leading-tight py-0.5" style={H}>
                    {ev.title}
                  </span>
                ))}
                {dayEvs.length > 2 && <span className="text-[9px] text-white/25">+{dayEvs.length - 2} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface Props { events: Event[] }

export default function REventsPage({ events }: Props) {
  const [view, setView] = useState<'card' | 'calendar'>('card');

  return (
    <Layout
      title="Events — Ruach Tabernacle"
      description="Upcoming events at Ruach Tabernacle — gatherings designed to encounter God, build community, and see lives transformed."
    >

      {/* HERO */}
      <section className="relative min-h-[65vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/church-photos/rhema-feast.jpg" alt="Ruach Tabernacle Events"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/aug-2025-a.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10]/70 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '5%', right: '-5%', filter: 'blur(150px)', opacity: 0.09, ['--spirit-dur' as string]: '11s' }} />
        <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none">
          <span className="text-[110px] md:text-[170px] italic text-white/5 whitespace-nowrap leading-none" style={H}>
            Events. &nbsp; Events. &nbsp; Events.
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24 pt-36 w-full">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white border border-white/15 bg-white/5 mb-6" style={H}>
            What&apos;s Coming
          </span>
          <h1 className="text-[38px] sm:text-5xl md:text-[58px] text-white leading-[1.05] tracking-tight mb-5" style={H}>Events</h1>
          <p className="text-[#8B95A8] text-lg max-w-md leading-relaxed" style={serif}>Moments designed by God. Made for you.</p>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#0A0C10] py-5 overflow-hidden border-t border-white/5">
        <div className="flex">
          {[0, 1].map(t => (
            <div key={t} className="flex-shrink-0 flex items-center gap-12 animate-[marquee_28s_linear_infinite]" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="flex items-center gap-6 flex-shrink-0 whitespace-nowrap text-[28px] md:text-[36px] font-black uppercase tracking-tight" style={H}>
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
          <div className="flex items-center justify-between gap-4 mb-12 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#BF0A30]/15 text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest border border-[#BF0A30]/20" style={H}>
                Upcoming
              </span>
              <h2 className="text-4xl md:text-5xl text-white leading-tight" style={H}>
                Upcoming <span style={serif}>Events.</span>
              </h2>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-xl p-1">
              <button onClick={() => setView('card')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${view === 'card' ? 'bg-[#BF0A30] text-white' : 'text-white/50 hover:text-white'}`} style={H}>
                <LayoutGrid className="w-3.5 h-3.5" /> Cards
              </button>
              <button onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${view === 'calendar' ? 'bg-[#BF0A30] text-white' : 'text-white/50 hover:text-white'}`} style={H}>
                <Calendar className="w-3.5 h-3.5" /> Calendar
              </button>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white text-xl mb-2" style={H}>No upcoming events at the moment</p>
              <p className="text-[#8B95A8] text-sm">Check back soon — something is always coming.</p>
            </div>
          ) : view === 'card' ? (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map(ev => <EventCard key={ev.id} ev={ev} />)}
            </div>
          ) : (
            <CalendarView events={events} />
          )}
        </div>
      </section>

      {/* PAST EVENTS NOTE */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>More from Ruach</p>
          <h2 className="text-3xl md:text-4xl text-[#111827] mb-5 leading-tight" style={H}>
            Catch up on<br /><span style={serif}>past messages.</span>
          </h2>
          <p className="text-[#6B7280] leading-relaxed mb-8">
            Missed a service or want to revisit a message? Our full library of sermons and past event recordings is available online.
          </p>
          <Link href="/sermons"
            className="inline-flex items-center gap-2 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all"
            style={H}>
            Watch Sermons <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#BF0A30] py-16 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl text-white mb-4" style={H}>Plan your visit.</h2>
          <p className="text-red-100 mb-8 leading-relaxed">We&apos;d love to see you at one of our events — or any Sunday morning.</p>
          <Link href="/new-here"
            className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
            style={H}>
            Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const today = new Date().toISOString().split('T')[0];
  const BASE = 'id, title, description, event_date, end_date, start_time, end_time, location, image_url, category';
  const run = (cols: string) => supabase
    .from('events')
    .select(cols)
    .gte('event_date', today)
    .neq('status', 'cancelled')
    .order('event_date', { ascending: true });
  try {
    // Prefer the full set; if the CTA/maps columns aren't migrated yet, fall
    // back to the base columns so the page still lists events (never 0).
    let { data, error } = await run(`${BASE}, link_url, link_label, map_url`);
    if (error) ({ data } = await run(BASE));
    return { props: { events: data ?? [] } };
  } catch {
    return { props: { events: [] } };
  }
};
