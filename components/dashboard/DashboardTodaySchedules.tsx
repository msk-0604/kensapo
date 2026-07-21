"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  formatDateTimeTime,
  formatTime,
  nowISO,
  todayISO,
} from "@/lib/utils";
import { notifyCompanyUpdate } from "@/lib/push/client";
import type { ScheduleWithDetails } from "@/lib/schedules";

export function DashboardTodaySchedules({
  schedules,
}: {
  schedules: ScheduleWithDetails[];
}) {
  const router = useRouter();

  if (schedules.length === 0) return null;

  async function quickStart(id: string) {
    const schedule = schedules.find((s) => s.id === id);
    const title = schedule?.title || schedule?.project_name || "作業";
    const supabase = createClient();
    const now = nowISO();
    await supabase
      .from("schedules")
      .update({
        actual_start_time: now,
        status: "in_progress",
        updated_at: now,
      })
      .eq("id", id);
    void notifyCompanyUpdate({
      title: "作業を開始しました",
      body: `${title} の作業が始まりました`,
      url: "/schedule",
      tag: `schedule-start-${id}`,
    });
    router.refresh();
  }

  async function quickEnd(id: string) {
    const schedule = schedules.find((s) => s.id === id);
    const title = schedule?.title || schedule?.project_name || "作業";
    const supabase = createClient();
    const now = nowISO();
    await supabase
      .from("schedules")
      .update({
        actual_end_time: now,
        status: "completed",
        updated_at: now,
      })
      .eq("id", id);
    void notifyCompanyUpdate({
      title: "作業を終了しました",
      body: `${title} の作業が終わりました`,
      url: "/schedule",
      tag: `schedule-end-${id}`,
    });
    router.refresh();
  }

  return (
    <section className="mb-2">
      <h2 className="mb-4 text-xl font-bold text-gray-800">今日の予定</h2>
      <ul className="space-y-4">
        {schedules.map((s) => {
          const title = s.title || s.project_name;
          const time =
            s.scheduled_start_time || s.scheduled_end_time
              ? `${formatTime(s.scheduled_start_time) || "—"} ${title}`
              : title;

          return (
            <li key={s.id}>
              <Card className="!p-5">
                <p className="text-lg font-bold text-navy-950">{time}</p>
                {s.work_content ? (
                  <p className="mt-2 text-base text-gray-600">
                    {s.work_content}
                  </p>
                ) : null}
                {s.worker_name ? (
                  <p className="mt-1 text-base text-gray-500">
                    担当：{s.worker_name}
                  </p>
                ) : null}
                {s.actual_start_time ? (
                  <p className="mt-2 text-base font-bold text-green-800">
                    開始：{formatDateTimeTime(s.actual_start_time)}
                    {s.actual_end_time
                      ? ` / 終了：${formatDateTimeTime(s.actual_end_time)}`
                      : ""}
                  </p>
                ) : null}
                {s.schedule_date === todayISO() && s.status !== "completed" ? (
                  <div className="mt-5 space-y-3">
                    <Button
                      type="button"
                      fullWidth
                      size="lg"
                      disabled={s.status === "in_progress"}
                      onClick={() => quickStart(s.id)}
                    >
                      {s.status === "in_progress" ? "作業中です" : "作業を開始する"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      size="lg"
                      disabled={
                        !s.actual_start_time && s.status !== "in_progress"
                      }
                      onClick={() => quickEnd(s.id)}
                    >
                      作業を終了する
                    </Button>
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
