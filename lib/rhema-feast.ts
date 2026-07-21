// Single source of truth for the Rhema Feast 2026 details, shared by the
// dedicated page and the homepage hero countdown.
export const RHEMA_FEAST_2026 = {
  title: 'Rhema Feast 2026',
  edition: '11th Edition',
  dates: '31 August – 4 September 2026',
  shortDates: '31 Aug – 4 Sep',
  venue: 'Uhuru Park',
  location: 'Uhuru Park · Nairobi, Kenya',
  // Midnight EAT (UTC+3) on the opening day.
  target: '2026-08-31T00:00:00+03:00',
  href: '/rhema-feast-2026',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Uhuru+Park,+Nairobi',
} as const;
