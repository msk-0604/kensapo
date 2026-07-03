"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/Loading";
import { HintBox } from "@/components/ui/HintBox";

export function GenerateReport({
  projectId,
  reportId,
}: {
  projectId: string;
  reportId: string;
}) {
  const router = useRouter();
  const [formatted, setFormatted] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      const supabase = createClient();
      const { data: reportData, error: reportError } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("id", reportId)
        .eq("project_id", projectId)
        .single();

      if (reportError || !reportData) {
        setError("日報が見つかりませんでした。もう一度日報を作成してください。");
        setLoading(false);
        return;
      }

      if (reportData.ai_report) {
        setFormatted(reportData.ai_report);
        setLoading(false);
        return;
      }

      setGenerating(true);
      try {
        const res = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ projectId, reportId }),
        });

        const json = await res.json();
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error(
              "しばらく時間をおいてから、もう一度お試しください。"
            );
          }
          throw new Error(
            json.error === "Service unavailable"
              ? "報告書の作成機能が利用できません。管理者にお問い合わせください。"
              : "報告書の作成に失敗しました。もう一度お試しください。"
          );
        }

        setFormatted(json.formattedText);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "報告書の作成に失敗しました"
        );
      } finally {
        setGenerating(false);
        setLoading(false);
      }
    }

    run();
  }, [projectId, reportId]);

  if (loading || generating) {
    return (
      <LoadingScreen
        message={
          generating
            ? "お客様向けの報告書を作成しています。30秒ほどお待ちください。"
            : "日報を読み込んでいます。少々お待ちください。"
        }
      />
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-lg text-red-700">
          {error}
        </p>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => router.push(`/projects/${projectId}`)}
        >
          現場の画面に戻る
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <HintBox>
        <p className="font-bold">報告書ができました</p>
        <p className="mt-1">
          内容を確認して、印刷ボタンからお客様に渡せる形で保存できます。
        </p>
      </HintBox>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-navy-950">
          お客様向け報告書
        </h2>
        <pre className="whitespace-pre-wrap font-sans text-lg leading-loose text-gray-800">
          {formatted}
        </pre>
      </section>

      <section className="space-y-4">
        <Link href={`/projects/${projectId}/reports/${reportId}/pdf`}>
          <Button fullWidth>報告書を印刷する</Button>
        </Link>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => router.push(`/projects/${projectId}`)}
        >
          現場の画面に戻る
        </Button>
      </section>
    </section>
  );
}
