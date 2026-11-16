import type { Repeat } from '../data/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Parse YYYY-MM-DD as a local date (no time-zone shift). */
export function parseISODate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** "Wed Nov 25, 10:00 AM" like the website. */
export function formatDue(iso: string, time: string): string {
  const d = parseISODate(iso);
  const day = d ? `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}` : '';
  return [day, time.trim()].filter(Boolean).join(', ') || 'No date set';
}

/** "Sunday, November 15" */
export function formatLongDate(d: Date): string {
  return `${LONG_DAYS[d.getDay()]}, ${LONG_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "11/15/2026 9:35 PM" like the website's "Last run" column. */
export function formatStamp(d: Date): string {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

export function formatClock(d: Date): string {
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

/** The next date in a repeating series. */
export function nextRepeatDate(iso: string, repeat: Repeat): string {
  switch (repeat) {
    case 'Every day':
      return addDays(iso, 1);
    case 'Every week':
      return addDays(iso, 7);
    case 'Every 2 weeks':
      return addDays(iso, 14);
    case 'Every month': {
      const d = parseISODate(iso);
      if (!d) return iso;
      const day = d.getDate();
      const n = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const last = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
      n.setDate(Math.min(day, last));
      return toISODate(n);
    }
    default:
      return iso;
  }
}
