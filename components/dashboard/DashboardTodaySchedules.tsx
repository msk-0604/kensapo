"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  groupSchedulesByProject,
  type ScheduleWithDetails,
} from "@/lib/schedules-group";

export function DashboardTodaySchedules({
  schedules,
}: {
  schedules: ScheduleWithDetails[];
}) {
  const router = useRouter();
  const grouped = groupSchedulesByProject(schedules);

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
      <h2 className="mb-4 text-xl font-bold text-gray-800">今日の予定（現場別）</h2>
      <div className="space-y-6">
        {grouped.map((group) => (
          <section key={group.projectId}>
            <div className="mb-3 rounded-2xl bg-navy-900 px-4 py-3 text-white">
              <p className="text-base font-bold text-white/75">現場</p>
              <Link
                href={`/sites/${group.projectId}`}
                className="mt-1 block text-xl font-bold underline"
              >
                {group.projectName}
              </Link>
              <p className="mt-2 text-base text-white/85">
                作業員：
                {group.workerNames.length > 0
                  ? group.workerNames.join("、")
                  : "未割当"}
              </p>
            </div>
            <ul className="space-y-4">
              {group.items.map((s) => {
                const title = s.title || s.work_content || "作業";
                const timeLabel =
                  s.scheduled_start_time || s.scheduled_end_time
                    ? `${formatTime(s.scheduled_start_time) || "—"}〜${formatTime(s.scheduled_end_time) || "—"}`
                    : null;

                return (
                  <li key={s.id}>
                    <Card className="!p-5">
                      <p className="text-2xl font-bold text-navy-950">
                        {s.worker_name || "作業員未割当"}
                      </p>
                      {timeLabel ? (
                        <p className="mt-2 text-base font-bold text-navy-700">
                          {timeLabel}
                        </p>
                      ) : null}
                      <p className="mt-2 text-lg text-gray-700">{title}</p>
                      {s.actual_start_time ? (
                        <p className="mt-2 text-base font-bold text-green-800">
                          開始：{formatDateTimeTime(s.actual_start_time)}
                          {s.actual_end_time
                            ? ` / 終了：${formatDateTimeTime(s.actual_end_time)}`
                            : ""}
                        </p>
                      ) : null}
                      {s.schedule_date === todayISO() &&
                      s.status !== "completed" ? (
                        <div className="mt-5 space-y-3">
                          <Button
                            type="button"
                            fullWidth
                            size="lg"
                            disabled={s.status === "in_progress"}
                            onClick={() => quickStart(s.id)}
                          >
                            {s.status === "in_progress"
                              ? "作業中です"
                              : "作業を開始する"}
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
        ))}
      </div>
    </section>
  );
}
