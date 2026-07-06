import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSite } from "@/lib/sites";
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayISO } from "@/lib/utils";

export default async function SiteReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("project_id", id)
    .order("report_date", { ascending: false });

  const today = todayISO();

  return (
    <>
      <PageHeader
        title="日報一覧"
        description={`現場名：${site.name}`}
        backHref={`/sites/${id}`}
        backLabel="現場の画面に戻る"
        action={
          <Link href={`/sites/${id}/reports/new`}>
            <Button fullWidth size="md">
              新しい日報を書く
            </Button>
          </Link>
        }
      />

      {!reports?.length ? (
        <EmptyState
          title="日報がまだありません"
          description="今日の作業内容を記録して、お客様向けの報告書を作成できます。"
          action={
            <Link href={`/sites/${id}/reports/new`}>
              <Button fullWidth>日報を書く</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => {
            const isToday = report.report_date === today;
            const missing = isToday && report.status === "draft";
            return (
              <li key={report.id}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-navy-950">
                        作業日：{formatDate(report.report_date)}
                      </p>
                      <p className="mt-2 text-base text-gray-600 line-clamp-2">
                        {report.work_content || "作業内容なし"}
                      </p>
                      {missing ? (
                        <p className="mt-2 text-base font-bold text-amber-700">
                          未提出の日報です
                        </p>
                      ) : null}
                    </div>
                    {report.ai_report ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
                        報告書あり
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
                        報告書なし
                      </span>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {report.ai_report ? (
                      <Link
                        href={`/sites/${id}/reports/${report.id}/generate`}
                      >
                        <Button variant="secondary" fullWidth size="md">
                          報告書を見る・編集する
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={`/sites/${id}/reports/${report.id}/generate`}
                      >
                        <Button fullWidth size="md">
                          報告書を作る
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
