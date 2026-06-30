export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysBetween(start, end) {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
