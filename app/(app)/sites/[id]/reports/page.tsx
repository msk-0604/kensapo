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
          description="今日の作業内容を記録できます。"
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
                  <p className="text-lg font-bold text-navy-950">
                    作業日：{formatDate(report.report_date)}
                  </p>
                  {report.weather ? (
                    <p className="mt-1 text-base text-gray-600">
                      天気：{report.weather}
                    </p>
                  ) : null}
                  {report.workers_count != null ? (
                    <p className="mt-1 text-base text-gray-600">
                      人数：{report.workers_count}人
                    </p>
                  ) : null}
                  <p className="mt-2 text-base text-gray-800 whitespace-pre-wrap">
                    {report.work_content || "作業内容なし"}
                  </p>
                  {report.materials ? (
                    <p className="mt-2 text-base text-gray-600">
                      材料：{report.materials}
                    </p>
                  ) : null}
                  {report.issues ? (
                    <p className="mt-2 text-base text-gray-600">
                      問題点：{report.issues}
                    </p>
                  ) : null}
                  {report.next_plan ? (
                    <p className="mt-2 text-base text-gray-600">
                      明日の予定：{report.next_plan}
                    </p>
                  ) : null}
                  {missing ? (
                    <p className="mt-2 text-base font-bold text-amber-700">
                      未提出の日報です
                    </p>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
