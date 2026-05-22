import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

function toICSDate(dateStr: string, timeStr?: string | null): string {
  const d = dateStr.replace(/-/g, '');
  if (!timeStr) return d;
  const t = timeStr.replace(/:/g, '').substring(0, 6).padEnd(6, '0');
  return `${d}T${t}`;
}

function escape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).send('Missing event id');
  }

  const { data: ev } = await supabase
    .from('events')
    .select('id, title, description, event_date, end_date, start_time, end_time, location')
    .eq('id', id)
    .single();

  if (!ev) return res.status(404).send('Event not found');

  const dtStart = toICSDate(ev.event_date, ev.start_time);
  const dtEnd   = toICSDate(ev.end_date ?? ev.event_date, ev.end_time ?? ev.start_time);
  const allDay  = !ev.start_time;

  const uid  = `${ev.id}@ruachtabernacle.org`;
  const now  = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ruach Tabernacle//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    allDay ? `DTEND;VALUE=DATE:${dtEnd}`   : `DTEND:${dtEnd}`,
    `SUMMARY:${escape(ev.title)}`,
    ev.description ? `DESCRIPTION:${escape(ev.description)}` : '',
    ev.location    ? `LOCATION:${escape(ev.location)}`       : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  const filename = ev.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.ics"`);
  res.status(200).send(lines);
}
