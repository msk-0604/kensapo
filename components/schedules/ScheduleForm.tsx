"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { todayISO } from "@/lib/utils";
import { notifyCompanyUpdate } from "@/lib/push/client";
import type { Project, Worker } from "@/types/database";
import type { ScheduleWithDetails } from "@/lib/schedules";

export function ScheduleForm({
  companyId,
  workers,
  projects,
  schedule,
  defaultDate,
  onCancel,
}: {
  companyId: string;
  workers: Worker[];
  projects: Project[];
  schedule?: ScheduleWithDetails;
  defaultDate?: string;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    schedule_date: schedule?.schedule_date ?? defaultDate ?? todayISO(),
    project_id: schedule?.project_id ?? projects[0]?.id ?? "",
    worker_id: schedule?.worker_id ?? workers[0]?.id ?? "",
    client_company_name: schedule?.client_company_name ?? "",
    location: schedule?.location ?? "",
    title: schedule?.title ?? "",
    work_content: schedule?.work_content ?? "",
    scheduled_start_time: schedule?.scheduled_start_time?.slice(0, 5) ?? "08:30",
    scheduled_end_time: schedule?.scheduled_end_time?.slice(0, 5) ?? "17:00",
    memo: schedule?.memo ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const payload = {
      project_id: form.project_id,
      worker_id: form.worker_id || null,
      schedule_date: form.schedule_date,
      client_company_name: form.client_company_name.trim() || null,
      location: form.location.trim() || null,
      title: form.title.trim() || null,
      work_content: form.work_content.trim() || null,
      scheduled_start_time: form.scheduled_start_time || null,
      scheduled_end_time: form.scheduled_end_time || null,
      memo: form.memo.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = schedule
      ? await supabase
          .from("schedules")
          .update(payload)
          .eq("id", schedule.id)
      : await supabase.from("schedules").insert({
          ...payload,
          company_id: companyId,
          status: "scheduled",
        });

    setLoading(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }

    if (onCancel) onCancel();
    const projectName =
      projects.find((p) => p.id === form.project_id)?.name || "現場";
    void notifyCompanyUpdate({
      title: schedule ? "予定を変更しました" : "新しい予定が入りました",
      body: `${form.schedule_date} / ${projectName}${
        form.title.trim() ? `：${form.title.trim()}` : ""
      }`,
      url: `/schedule?date=${form.schedule_date}`,
      tag: `schedule-${schedule?.id ?? "new"}`,
    });
    router.replace(`/schedule?date=${form.schedule_date}`);
  }

  if (projects.length === 0) {
    return (
      <p className="text-lg text-gray-600">
        予定を登録するには、先に現場を登録してください。
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="作業する日"
        type="date"
        value={form.schedule_date}
        onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
        required
      />
      <Input
        label="会社名（任意）"
        value={form.client_company_name}
        onChange={(e) =>
          setForm({ ...form, client_company_name: e.target.value })
        }
        placeholder="例：○○建設"
      />
      <Input
        label="場所（任意）"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        placeholder="例：東京都世田谷区"
      />
      <Input
        label="現場名・タイトル（任意）"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="例：○○様邸"
      />
      <Select
        label="現場（必須）"
        value={form.project_id}
        onChange={(e) => setForm({ ...form, project_id: e.target.value })}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Textarea
        label="作業内容"
        value={form.work_content}
        onChange={(e) => setForm({ ...form, work_content: e.target.value })}
        rows={3}
        placeholder="例：給水配管施工"
        required
      />
      {workers.length > 0 ? (
        <Select
          label="担当作業員（任意）"
          value={form.worker_id}
          onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
        >
          <option value="">未指定</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </Select>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="開始予定"
          type="time"
          value={form.scheduled_start_time}
          onChange={(e) =>
            setForm({ ...form, scheduled_start_time: e.target.value })
          }
        />
        <Input
          label="終了予定"
          type="time"
          value={form.scheduled_end_time}
          onChange={(e) =>
            setForm({ ...form, scheduled_end_time: e.target.value })
          }
        />
      </div>
      <Textarea
        label="メモ（任意）"
        value={form.memo}
        onChange={(e) => setForm({ ...form, memo: e.target.value })}
        rows={2}
      />
      {error ? (
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
          {error}
        </p>
      ) : null}
      <div className={onCancel ? "grid grid-cols-2 gap-3" : ""}>
        {onCancel ? (
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
            やめる
          </Button>
        ) : null}
        <Button type="submit" fullWidth loading={loading}>
          {loading
            ? "保存しています"
            : schedule
              ? "変更を保存する"
              : "この予定を登録する"}
        </Button>
      </div>
    </form>
  );
}
