"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, ProjectStatus } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { LIMITS } from "@/lib/security/validation";
import { notifyCompanyUpdate } from "@/lib/push/client";

type Props = {
  project?: Project;
  companyId: string;
};

const defaultForm = {
  name: "",
  address: "",
  manager_name: "",
  start_date: "",
  end_date: "",
  status: "not_started" as ProjectStatus,
  memo: "",
};

export function ProjectForm({ project }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(
    project
      ? {
          name: project.name,
          address: project.address ?? "",
          manager_name: project.manager_name ?? "",
          start_date: project.start_date ?? "",
          end_date: project.end_date ?? "",
          status: project.status,
          memo: project.memo ?? "",
        }
      : defaultForm
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 20000);

      const res = await fetch("/api/projects", {
        method: project ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(
          project
            ? { id: project.id, ...form }
            : form
        ),
      }).finally(() => window.clearTimeout(timer));

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; id?: string; name?: string; error?: string }
        | null;

      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "保存に失敗しました。もう一度お試しください。");
      }

      void notifyCompanyUpdate({
        title: project ? "現場情報を更新しました" : "新しい現場が登録されました",
        body: project ? `${form.name} の内容が変更されました` : form.name,
        url: `/sites/${data.id}`,
        tag: `site-${data.id}`,
      });

      router.replace(`/sites/${data.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("保存がタイムアウトしました。通信状況を確認して、もう一度お試しください。");
      } else {
        setError(err instanceof Error ? err.message : "保存に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="現場の名前（必須）"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        maxLength={LIMITS.projectName}
        required
      />
      <Input
        label="住所"
        value={form.address}
        onChange={(e) => update("address", e.target.value)}
      />
      <Input
        label="担当者名"
        value={form.manager_name}
        onChange={(e) => update("manager_name", e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="着工日"
          type="date"
          value={form.start_date}
          onChange={(e) => update("start_date", e.target.value)}
        />
        <Input
          label="完了予定日"
          type="date"
          value={form.end_date}
          onChange={(e) => update("end_date", e.target.value)}
        />
      </div>
      <Select
        label="工事の状態"
        value={form.status}
        onChange={(e) => update("status", e.target.value as ProjectStatus)}
      >
        {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
          <option key={s} value={s}>
            {PROJECT_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <Textarea
        label="メモ（任意）"
        value={form.memo}
        onChange={(e) => update("memo", e.target.value)}
        rows={4}
      />
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" fullWidth loading={loading}>
        {loading
          ? "保存しています"
          : project
            ? "変更を保存する"
            : "この現場を登録する"}
      </Button>
    </form>
  );
}
