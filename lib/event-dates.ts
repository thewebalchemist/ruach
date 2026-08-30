// Shared date helpers for events — used by both calendars and the list queries
// so multi-day events span every day they run, and ongoing events still count.

/** Parse a 'YYYY-MM-DD' (or ISO) string as a LOCAL date, avoiding the UTC
 *  midnight → previous-day off-by-one you get from `new Date('2026-07-22')`. */
export function parseYMD(s: string): Date {
  const [y, m, d] = s.split('T')[0].split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Does an event cover the given calendar cell (year, month 0-indexed, day)?
 *  True for every day from event_date through end_date (inclusive). */
export function eventCoversDay(
  ev: { event_date: string; end_date?: string | null },
  year: number,
  month: number,
  day: number,
): boolean {
  const cell = new Date(year, month, day).getTime();
  const start = parseYMD(ev.event_date).getTime();
  const end = ev.end_date ? parseYMD(ev.end_date).getTime() : start;
  return cell >= start && cell <= end;
}
