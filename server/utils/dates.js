// Date helpers. All study dates are plain 'YYYY-MM-DD' strings in the student's local calendar.

const pad = (n) => String(n).padStart(2, '0');

export const isDateStr = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Student's "today" (sent by the client as ?today=YYYY-MM-DD); falls back to server local date
export const getToday = (value) => (isDateStr(value) ? value : toDateStr(new Date()));

export const addDays = (dateStr, n) => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Whole days between a and b (a - b)
export const diffDays = (a, b) =>
  Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86400000);

export const weekdayOf = (dateStr) => new Date(`${dateStr}T00:00:00Z`).getUTCDay(); // 0 = Sunday

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const hourOfTime = (timeStr) => {
  const h = parseInt(String(timeStr || '').split(':')[0], 10);
  return Number.isNaN(h) ? 0 : Math.min(23, Math.max(0, h));
};

export const minutesOfTime = (timeStr) => {
  const [h, m] = String(timeStr || '00:00').split(':');
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
};

export const timeFromMinutes = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

export const TIME_BUCKETS = [
  { id: 'Morning', label: 'Morning', range: '5 AM – 12 PM', from: 5, to: 12 },
  { id: 'Afternoon', label: 'Afternoon', range: '12 PM – 5 PM', from: 12, to: 17 },
  { id: 'Evening', label: 'Evening', range: '5 PM – 9 PM', from: 17, to: 21 },
  { id: 'Night', label: 'Night', range: '9 PM – 5 AM', from: 21, to: 29 },
];

export const bucketOfHour = (hour) => {
  const h = hour < 5 ? hour + 24 : hour;
  return TIME_BUCKETS.find((b) => h >= b.from && h < b.to).id;
};

export const formatHour = (h) => {
  const hh = ((h % 24) + 24) % 24;
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const base = hh % 12 === 0 ? 12 : hh % 12;
  return `${base} ${suffix}`;
};

export const monthRange = (monthStr) => {
  // monthStr: 'YYYY-MM'
  const [y, m] = monthStr.split('-').map(Number);
  const start = `${y}-${pad(m)}-01`;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = `${y}-${pad(m)}-${pad(last)}`;
  return { start, end, days: last };
};

export const prevMonth = (monthStr) => {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};
