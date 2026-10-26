// Site-wide SEO facts and structured-data builders.
//
// Everything here must be verifiable. Leave a field out rather than guess:
// no phone number is published anywhere, so there is no `telephone`, and the
// Facebook page could not be confirmed, so it is not in `sameAs`.

export const SITE_URL  = 'https://ruachtabernacle.org';
export const SITE_NAME = 'Ruach Tabernacle Assembly';

export const DEFAULT_DESC =
  'A God-focused, Service-oriented, Community-driven church in Nairobi, Kenya. Join us every Sunday along the Northern Bypass, next to Shell Windsor.';

/** 1200×630 share cards generated from church photos (public/og). */
export const OG = {
  default: '/og/default.jpg',
  sermons: '/og/sermons.jpg',
  live:    '/og/live.jpg',
  visit:   '/og/visit.jpg',
  give:    '/og/give.jpg',
} as const;

/** Images known to be exactly 1200×630, so og:image:width/height are honest. */
export const OG_SIZED = new Set<string>(Object.values(OG));

// Pin and address from the church's own Google Maps listing, which every
// "Get directions" link on the site already uses.
export const MAPS_URL =
  'https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z';
const GEO = { '@type': 'GeoCoordinates', latitude: -1.2147391, longitude: 36.8476721 };
const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Rhema Grounds, Rhema Avenue, off Northern Bypass',
  addressLocality: 'Nairobi',
  addressRegion: 'Nairobi County',
  addressCountry: 'KE',
};
export const PLACE = {
  '@type': 'Place',
  name: 'Rhema Grounds',
  address: ADDRESS,
  geo: GEO,
};

export const CHURCH_ID = `${SITE_URL}/#church`;

export const CHURCH_JSON_LD = {
  '@type': 'Church',
  '@id': CHURCH_ID,
  name: SITE_NAME,
  alternateName: ['Ruach Tabernacle', 'Ruach Tabernacle Church'],
  description: DEFAULT_DESC,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  image: `${SITE_URL}${OG.default}`,
  email: 'hello@ruachtabernacle.org',
  address: ADDRESS,
  geo: GEO,
  hasMap: MAPS_URL,
  slogan: 'Raising Kingdom Champions',
  founder: { '@type': 'Person', name: 'Julian Kyula' },
  parentOrganization: { '@type': 'Organization', name: 'Ruach Assemblies' },
  sameAs: [
    'https://www.instagram.com/ruachtabernacle',
    'https://www.youtube.com/@ruachtabernacle',
  ],
  // Three services, the last one ending around 2 PM.
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/Sunday', opens: '08:00', closes: '14:00' },
  ],
};

/** The three Sunday services, as weekly schedules. */
export const SERVICE_TIMES = ['08:00', '10:00', '12:30'] as const;

/**
 * Sunday services for the coming Sunday as concrete Events. Only used on
 * pages that regenerate often (the homepage revalidates every 5 minutes),
 * so the date never goes stale.
 */
export function sundayServiceEvents(now = new Date()) {
  // Next Sunday in Nairobi time (UTC+3, no DST). Today counts until 2 PM.
  const nairobi = new Date(now.getTime() + 3 * 3600_000);
  const day = nairobi.getUTCDay();
  let add = (7 - day) % 7;
  if (day === 0 && nairobi.getUTCHours() >= 14) add = 7;
  const sunday = new Date(nairobi.getTime() + add * 86400_000);
  const ymd = sunday.toISOString().slice(0, 10);
  const labels = ['First', 'Second', 'Third'];
  return SERVICE_TIMES.map((t, i) => ({
    '@type': 'Event',
    name: `Sunday Service (${labels[i]} Service)`,
    startDate: `${ymd}T${t}:00+03:00`,
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: [PLACE, { '@type': 'VirtualLocation', url: `${SITE_URL}/live` }],
    eventSchedule: {
      '@type': 'Schedule',
      byDay: 'https://schema.org/Sunday',
      startTime: `${t}:00`,
      repeatFrequency: 'P1W',
      scheduleTimezone: 'Africa/Nairobi',
    },
    image: `${SITE_URL}${OG.default}`,
    description: 'Sunday worship at Ruach Tabernacle. Everyone is welcome.',
    isAccessibleForFree: true,
    organizer: { '@id': CHURCH_ID },
  }));
}

export interface EventRow {
  title: string;
  description?: string | null;
  event_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  image_url?: string | null;
}

/** An Event from the admin-managed events table. Real data only. */
export function eventJsonLd(ev: EventRow) {
  const time = (t?: string | null) => (t ? `T${t.length === 5 ? `${t}:00` : t}+03:00` : '');
  const start = `${ev.event_date}${time(ev.start_time)}`;
  const endDay = ev.end_date || (ev.end_time ? ev.event_date : null);
  return {
    '@type': 'Event',
    name: ev.title,
    ...(ev.description ? { description: ev.description.replace(/[#*_`]/g, '').slice(0, 300) } : {}),
    startDate: start,
    ...(endDay ? { endDate: `${endDay}${time(ev.end_time)}` } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: ev.location
      ? { '@type': 'Place', name: ev.location, address: ev.location }
      : PLACE,
    ...(ev.image_url ? { image: ev.image_url.startsWith('http') ? ev.image_url : `${SITE_URL}${ev.image_url}` } : {}),
    organizer: { '@id': CHURCH_ID },
  };
}

export function absUrl(path: string) {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

/**
 * Clean public URL for a route. router.asPath is "/index" for the homepage
 * when it is statically generated, which made "/index" the canonical.
 */
export function canonicalFor(asPath: string) {
  let p = asPath.split(/[?#]/)[0] || '/';
  if (p === '/index' || p === '/index_full') p = '/';
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return `${SITE_URL}${p}`;
}
