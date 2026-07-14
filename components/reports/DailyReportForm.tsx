"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WEATHER_OPTIONS } from "@/lib/constants";
import { LIMITS } from "@/lib/security/validation";
import { todayISO } from "@/lib/utils";
import { notifyCompanyUpdate } from "@/lib/push/client";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { HintBox } from "@/components/ui/HintBox";

export function DailyReportForm({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    report_date: todayISO(),
    weather: WEATHER_OPTIONS[0] as string,
    workers_count: 3,
    work_content: "",
    materials: "",
    issues: "",
    next_plan: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase
      .from("daily_reports")
      .insert({
        project_id: projectId,
        ...form,
        workers_count: Number(form.workers_count),
        created_by: user?.id ?? null,
        status: "submitted",
      })
      .select()
      .single();

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    void notifyCompanyUpdate({
      title: "日報が提出されました",
      body: `${projectName}（${form.report_date}）`,
      url: `/sites/${projectId}/reports`,
      tag: `report-${data.id}`,
    });

    router.replace(`/sites/${projectId}/reports`);
  }

  return (
    <>
      <HintBox>
        <p className="font-bold">「{projectName}」の日報を書きます</p>
        <p className="mt-1">今日の作業内容を入力して保存してください。</p>
      </HintBox>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="作業した日"
          type="date"
          value={form.report_date}
          onChange={(e) => setForm({ ...form, report_date: e.target.value })}
          required
        />
        <Select
          label="天気"
          value={form.weather}
          onChange={(e) => setForm({ ...form, weather: e.target.value })}
        >
          {WEATHER_OPTIONS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </Select>
        <Input
          label="作業した人数"
          type="number"
          min={0}
          value={form.workers_count}
          onChange={(e) =>
            setForm({ ...form, workers_count: Number(e.target.value) })
          }
          hint="その日に現場で働いた人数を入力してください"
          required
        />
        <Textarea
          label="今日の作業内容（必須）"
          value={form.work_content}
          onChange={(e) => setForm({ ...form, work_content: e.target.value })}
          maxLength={LIMITS.reportField}
          placeholder="例：1階の外壁タイル貼りを完了しました"
          required
          rows={5}
        />
        <Textarea
          label="使った資材（任意）"
          value={form.materials}
          onChange={(e) => setForm({ ...form, materials: e.target.value })}
          placeholder="例：タイル 50枚、セメント 2袋"
          rows={3}
        />
        <Textarea
          label="気になったこと・問題（任意）"
          value={form.issues}
          onChange={(e) => setForm({ ...form, issues: e.target.value })}
          placeholder="例：午後から雨が降り、作業を早めに切り上げました"
          rows={3}
        />
        <Textarea
          label="明日の予定（任意）"
          value={form.next_plan}
          onChange={(e) => setForm({ ...form, next_plan: e.target.value })}
          placeholder="例：2階の外壁タイル貼りを開始します"
          rows={3}
        />
        {error ? (
          <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
            {error}
          </p>
        ) : null}
        <Button type="submit" fullWidth loading={loading}>
          {loading ? "日報を保存しています" : "日報を保存する"}
        </Button>
      </form>
    </>
  );
}
