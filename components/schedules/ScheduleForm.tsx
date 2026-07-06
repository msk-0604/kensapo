"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { todayISO } from "@/lib/utils";
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
    work_content: schedule?.work_content ?? "",
  });

  useEffect(() => {
    if (defaultDate && !schedule) {
      setForm((f) => ({ ...f, schedule_date: defaultDate }));
    }
  }, [defaultDate, schedule]);

  useEffect(() => {
    if (projects.length && !form.project_id) {
      setForm((f) => ({ ...f, project_id: projects[0].id }));
    }
    if (workers.length && !form.worker_id) {
      setForm((f) => ({ ...f, worker_id: workers[0].id }));
    }
  }, [projects, workers, form.project_id, form.worker_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const payload = {
      project_id: form.project_id,
      worker_id: form.worker_id,
      schedule_date: form.schedule_date,
      work_content: form.work_content.trim() || null,
    };

    const { error: saveError } = schedule
      ? await supabase
          .from("schedules")
          .update(payload)
          .eq("id", schedule.id)
      : await supabase.from("schedules").insert({
          ...payload,
          company_id: companyId,
        });

    setLoading(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }

    if (onCancel) {
      onCancel();
    }
    router.push(`/schedule?date=${form.schedule_date}`);
    router.refresh();
  }

  if (workers.length === 0 || projects.length === 0) {
    return (
      <p className="text-lg text-gray-600">
        予定を登録するには、先に作業員と現場を登録してください。
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
      <Select
        label="現場"
        value={form.project_id}
        onChange={(e) => setForm({ ...form, project_id: e.target.value })}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Select
        label="作業員"
        value={form.worker_id}
        onChange={(e) => setForm({ ...form, worker_id: e.target.value })}
      >
        {workers.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </Select>
      <Textarea
        label="作業内容（任意）"
        value={form.work_content}
        onChange={(e) => setForm({ ...form, work_content: e.target.value })}
        rows={3}
        placeholder="例：外壁の足場組み立て"
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
        <Button type="submit" fullWidth loading={loading} className={onCancel ? "" : ""}>
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
