// All calendar logic runs on London wall-clock time, whatever the viewer's
// timezone, so a session on the 28th is always in the same invoicing period.

export const TZ = "Europe/London";
export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const partsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

export type LondonParts = { y: number; m: number; d: number; h: number; min: number };

export function londonParts(ms: number): LondonParts {
  const p: Record<string, string> = {};
  for (const part of partsFormat.formatToParts(new Date(ms))) p[part.type] = part.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute };
}

/** London wall-clock time to epoch ms. Day and month overflow is normalised (d=32 → next month). */
export function fromLondon(y: number, m: number, d: number, h = 0, min = 0): number {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const p = londonParts(guess);
  const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - guess;
  return guess - offset;
}

const weekdayFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" });
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const monthName = (m: number) => MONTHS_LONG[m - 1];
const pad = (n: number) => String(n).padStart(2, "0");

/** "22 Oct" */
export function fmtDay(ms: number) {
  const p = londonParts(ms);
  return `${p.d} ${MONTHS[p.m - 1]}`;
}
/** "Thu 22 Oct" */
export function fmtDate(ms: number) {
  return `${weekdayFormat.format(new Date(ms))} ${fmtDay(ms)}`;
}
/** "Thu 22 Oct 2026" */
export function fmtDateYear(ms: number) {
  return `${fmtDate(ms)} ${londonParts(ms).y}`;
}
/** "18:00" */
export function fmtTime(ms: number) {
  const p = londonParts(ms);
  return `${pad(p.h)}:${pad(p.min)}`;
}
/** "Thu 22 Oct, 18:00" */
export function fmtDateTime(ms: number) {
  return `${fmtDate(ms)}, ${fmtTime(ms)}`;
}

/** "5 days", "20 hours", "45 min" */
export function fmtDuration(ms: number) {
  const abs = Math.abs(ms);
  if (abs >= 2 * DAY) return `${Math.floor(abs / DAY)} days`;
  if (abs >= HOUR) return `${Math.floor(abs / HOUR)} hours`;
  return `${Math.max(1, Math.round(abs / MINUTE))} min`;
}

// <input type="date"> and <input type="time"> values, in London time.
export function toDateInput(ms: number) {
  const p = londonParts(ms);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}
export function toTimeInput(ms: number) {
  return fmtTime(ms);
}
export function fromInputs(date: string, time: string): number | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  return fromLondon(+d[1], +d[2], +d[3], +t[1], +t[2]);
}
