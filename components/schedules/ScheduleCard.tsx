"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SCHEDULE_STATUS_LABELS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  formatDateTimeTime,
  formatTime,
  nowISO,
  todayISO,
} from "@/lib/utils";
import type { ScheduleWithDetails } from "@/lib/schedules";

export function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  deleting,
}: {
  schedule: ScheduleWithDetails;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"start" | "end" | null>(null);
  const isToday = schedule.schedule_date === todayISO();
  const displayTitle =
    schedule.title || schedule.project_name || "現場作業";

  const timeRange =
    schedule.scheduled_start_time || schedule.scheduled_end_time
      ? `${formatTime(schedule.scheduled_start_time) || "—"}〜${formatTime(schedule.scheduled_end_time) || "—"}`
      : null;

  async function handleStart() {
    setLoading("start");
    const supabase = createClient();
    const now = nowISO();
    const { error } = await supabase
      .from("schedules")
      .update({
        actual_start_time: now,
        status: "in_progress",
        updated_at: now,
      })
      .eq("id", schedule.id);
    setLoading(null);
    if (error) {
      window.alert(error.message);
      return;
    }
    router.refresh();
  }

  async function handleEnd() {
    setLoading("end");
    const supabase = createClient();
    const now = nowISO();
    const { error } = await supabase
      .from("schedules")
      .update({
        actual_end_time: now,
        status: "completed",
        updated_at: now,
      })
      .eq("id", schedule.id);
    setLoading(null);
    if (error) {
      window.alert(error.message);
      return;
    }
    router.refresh();
  }

  const statusLabel = SCHEDULE_STATUS_LABELS[schedule.status] ?? schedule.status;

  return (
    <Card className="!p-5">
      {timeRange ? (
        <p className="text-base font-bold text-navy-700">{timeRange}</p>
      ) : null}
      <p className="mt-1 text-xl font-bold text-navy-950">{displayTitle}</p>

      {schedule.client_company_name ? (
        <p className="mt-2 text-base text-gray-600">
          会社：{schedule.client_company_name}
        </p>
      ) : null}
      {schedule.location ? (
        <p className="mt-1 text-base text-gray-600">
          場所：{schedule.location}
        </p>
      ) : null}
      {schedule.project_name ? (
        <p className="mt-1 text-base text-gray-600">
          現場：{schedule.project_name}
        </p>
      ) : null}

      {schedule.work_content ? (
        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-sm font-bold text-gray-500">作業内容</p>
          <p className="mt-1 text-lg text-navy-950">{schedule.work_content}</p>
        </div>
      ) : null}

      {schedule.worker_name ? (
        <p className="mt-3 text-base text-gray-600">
          担当：{schedule.worker_name}
        </p>
      ) : null}

      {schedule.actual_start_time || schedule.actual_end_time ? (
        <p className="mt-2 text-base font-bold text-green-800">
          実績：
          {schedule.actual_start_time
            ? formatDateTimeTime(schedule.actual_start_time)
            : "—"}
          〜
          {schedule.actual_end_time
            ? formatDateTimeTime(schedule.actual_end_time)
            : "—"}
        </p>
      ) : null}

      <p className="mt-2 text-sm font-bold text-gray-500">状態：{statusLabel}</p>

      {isToday && schedule.status !== "completed" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            type="button"
            fullWidth
            size="md"
            loading={loading === "start"}
            disabled={schedule.status === "in_progress"}
            onClick={handleStart}
          >
            開始する
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            size="md"
            loading={loading === "end"}
            disabled={!schedule.actual_start_time && schedule.status !== "in_progress"}
            onClick={handleEnd}
          >
            終了する
          </Button>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" size="md" fullWidth onClick={onEdit}>
          変更
        </Button>
        <Button
          type="button"
          variant="danger"
          size="md"
          fullWidth
          loading={deleting}
          onClick={onDelete}
        >
          削除
        </Button>
      </div>
    </Card>
  );
}
