export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function startOfWeekISO(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function getWeekDatesISO(anchorDate: string): string[] {
  const start = startOfWeekISO(anchorDate);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
}

export function formatWeekdayShort(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("ja-JP", {
    weekday: "short",
  });
}

export function formatMonthDay(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

export function clampDateISO(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return todayISO();
}
