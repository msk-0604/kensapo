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

export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  return time.slice(0, 5);
}

export function formatDateTimeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function nowISO(): string {
  return new Date().toISOString();
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

/** 月曜始まりの月カレンダー用日付一覧（前後月の端数を含む） */
export function getMonthMatrixISO(anchorDate: string): string[] {
  const d = new Date(`${anchorDate}T12:00:00`);
  const firstISO = new Date(d.getFullYear(), d.getMonth(), 1, 12)
    .toISOString()
    .slice(0, 10);
  const lastISO = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)
    .toISOString()
    .slice(0, 10);
  const start = startOfWeekISO(firstISO);
  const end = addDaysISO(startOfWeekISO(lastISO), 6);
  const dates: string[] = [];
  for (let cur = start; cur <= end; cur = addDaysISO(cur, 1)) {
    dates.push(cur);
  }
  return dates;
}

export function addMonthsISO(date: string, months: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function sameMonthISO(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

export function formatYearMonth(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });
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
