"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TRADE_OPTIONS, WORKER_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import type { Worker, WorkerStatus } from "@/types/database";

export function WorkerForm({
  worker,
  companyId,
}: {
  worker?: Worker;
  companyId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: worker?.name ?? "",
    phone: worker?.phone ?? "",
    trade: worker?.trade ?? TRADE_OPTIONS[0],
    status: (worker?.status ?? "active") as WorkerStatus,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      trade: form.trade || null,
      status: form.status,
    };

    try {
      if (worker) {
        const { error: updateError } = await supabase
          .from("workers")
          .update(payload)
          .eq("id", worker.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("workers")
          .insert({ ...payload, company_id: companyId });
        if (insertError) throw insertError;
      }
      router.replace("/workers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="作業員の名前（必須）"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Input
        label="電話番号"
        type="tel"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="090-1234-5678"
      />
      <Select
        label="職種"
        value={form.trade}
        onChange={(e) => setForm({ ...form, trade: e.target.value })}
      >
        {TRADE_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <Select
        label="稼働状況"
        value={form.status}
        onChange={(e) =>
          setForm({ ...form, status: e.target.value as WorkerStatus })
        }
      >
        {(Object.keys(WORKER_STATUS_LABELS) as WorkerStatus[]).map((s) => (
          <option key={s} value={s}>
            {WORKER_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      {error ? (
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" fullWidth loading={loading}>
        {loading ? "保存しています" : worker ? "変更を保存する" : "作業員を登録する"}
      </Button>
    </form>
  );
}
