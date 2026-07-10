"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatMonthDay, formatWeekdayShort, todayISO } from "@/lib/utils";

export function ScheduleWeekNav({
  selectedDate,
  weekDates,
  scheduleCounts,
}: {
  selectedDate: string;
  weekDates: string[];
  scheduleCounts: Record<string, number>;
}) {
  const router = useRouter();
  const today = todayISO();

  function goWeek(offset: number) {
    const base = weekDates[0];
    const d = new Date(`${base}T12:00:00`);
    d.setDate(d.getDate() + offset * 7);
    const next = d.toISOString().slice(0, 10);
    router.push(`/schedule?date=${next}`);
  }

  return (
    <section className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goWeek(-1)}
          className="min-h-[3.5rem] rounded-xl border-2 border-gray-200 px-4 text-lg font-bold text-navy-900"
        >
          前の週
        </button>
        <button
          type="button"
          onClick={() => router.push(`/schedule?date=${today}`)}
          className="min-h-[3.5rem] rounded-xl bg-navy-900 px-4 text-lg font-bold text-white"
        >
          今日
        </button>
        <button
          type="button"
          onClick={() => goWeek(1)}
          className="min-h-[3.5rem] rounded-xl border-2 border-gray-200 px-4 text-lg font-bold text-navy-900"
        >
          次の週
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date) => {
          const selected = date === selectedDate;
          const isToday = date === today;
          const count = scheduleCounts[date] ?? 0;

          return (
            <Link
              key={date}
              href={`/schedule?date=${date}`}
              className={cn(
                "flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border-2 px-1 py-2 text-center transition-colors",
                selected
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-gray-100 bg-gray-50 text-navy-950 hover:border-navy-300",
                isToday && !selected && "border-navy-400"
              )}
            >
              <span className="text-sm font-bold opacity-80">
                {formatWeekdayShort(date)}
              </span>
              <span className="text-xl font-bold">{formatMonthDay(date)}</span>
              {count > 0 ? (
                <span
                  className={cn(
                    "mt-1 rounded-full px-2 text-sm font-bold",
                    selected ? "bg-white/20" : "bg-navy-900 text-white"
                  )}
                >
                  {count}件
                </span>
              ) : (
                <span className="mt-1 text-sm opacity-50">—</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
