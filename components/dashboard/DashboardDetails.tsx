import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressCharts } from "@/components/dashboard/ProgressCharts";
import { DashboardTodaySchedules } from "@/components/dashboard/DashboardTodaySchedules";
import { DashboardSiteProgress } from "@/components/dashboard/DashboardSiteProgress";
import { getSites } from "@/lib/sites";
import { getDashboardStats } from "@/lib/dashboard";
import { getProgressChartData } from "@/lib/progress";
import { formatDate } from "@/lib/utils";

async function DashboardCharts() {
  const progressData = await getProgressChartData().catch(() => null);
  if (!progressData) return null;

  return (
    <div className="mb-8 hidden sm:block">
      <ProgressCharts data={progressData} />
    </div>
  );
}

export async function DashboardDetails() {
  let sites: Awaited<ReturnType<typeof getSites>> = [];
  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null;

  try {
    [sites, stats] = await Promise.all([
      getSites(),
      getDashboardStats().catch(() => null),
    ]);
  } catch {
    return (
      <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-center">
        <p className="text-lg font-bold text-amber-900">
          データの読み込みに失敗しました
        </p>
        <p className="mt-2 text-base text-amber-800">
          上のボタンから操作を続けられます。しばらくしてから再読み込みしてください。
        </p>
      </section>
    );
  }

  if (sites.length === 0) {
    return (
      <EmptyState
        title="現場がまだ登録されていません"
        description="まずは工事の現場を登録してください。登録が終わると、写真の追加や日報の作成ができるようになります。"
        steps={[
          "下のボタンを押して、現場の名前と住所を入力する",
          "作業員を登録して、予定を組む",
          "現場で写真や日報を記録する",
        ]}
        action={
          <Link href="/sites/new">
            <Button fullWidth>新しい現場を登録する</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      {stats ? (
        <section className="mb-8 grid grid-cols-2 gap-4">
          <Card className="!p-5 text-center">
            <p className="text-base font-bold text-gray-600">今日の現場</p>
            <p className="mt-2 text-4xl font-bold text-navy-950">
              {stats.todaySiteCount}
            </p>
            <p className="mt-1 text-base text-gray-500">か所（進行中）</p>
          </Card>
          <Card className="!p-5 text-center">
            <p className="text-base font-bold text-gray-600">今日の予定</p>
            <p className="mt-2 text-4xl font-bold text-navy-950">
              {stats.todayWorkerCount}
            </p>
            <p className="mt-1 text-base text-gray-500">人（予定）</p>
          </Card>
          <Card className="!p-5 text-center col-span-2">
            <p className="text-base font-bold text-gray-600">未提出の日報</p>
            <p className="mt-2 text-4xl font-bold text-amber-700">
              {stats.missingReportCount}
            </p>
            <p className="mt-1 text-base text-gray-500">件</p>
          </Card>
          {stats.pendingChecklistCount > 0 ? (
            <Card className="!p-5 text-center col-span-2">
              <p className="text-base font-bold text-gray-600">未完了チェック</p>
              <p className="mt-2 text-4xl font-bold text-amber-700">
                {stats.pendingChecklistCount}
              </p>
              <p className="mt-1 text-base text-gray-500">件</p>
            </Card>
          ) : null}
        </section>
      ) : null}

      {stats && stats.inProgressSchedules.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-800">進行中の作業</h2>
          <ul className="space-y-3">
            {stats.inProgressSchedules.map((s) => (
              <li key={s.id}>
                <Card className="!p-4">
                  <p className="font-bold text-navy-950">
                    {s.title || s.project_name}
                  </p>
                  <p className="mt-1 text-base text-green-800">
                    作業中
                    {s.work_content ? ` — ${s.work_content}` : ""}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {stats ? (
        <DashboardSiteProgress summaries={stats.siteProgressSummaries} />
      ) : null}

      <Suspense fallback={null}>
        <DashboardCharts />
      </Suspense>

      {stats && stats.latestPhotos.length > 0 ? (
        <section className="mb-8 hidden sm:block">
          <h2 className="mb-4 text-xl font-bold text-gray-800">最新の写真</h2>
          <ul className="space-y-3">
            {stats.latestPhotos.map((photo) => (
              <li key={photo.id}>
                <Link href={`/sites/${photo.project_id}/photos`}>
                  <Card className="!p-4">
                    <p className="text-lg font-bold text-navy-950">
                      {photo.title || photo.comment || "現場の写真"}
                    </p>
                    <p className="mt-1 text-base text-gray-500">
                      {photo.project_name} / {formatDate(photo.taken_at)}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {stats && stats.latestReports.length > 0 ? (
        <section className="mb-8 hidden sm:block">
          <h2 className="mb-4 text-xl font-bold text-gray-800">最新の報告書</h2>
          <ul className="space-y-3">
            {stats.latestReports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/sites/${report.project_id}/reports/${report.id}/generate`}
                >
                  <Card className="!p-4">
                    <p className="text-lg font-bold text-navy-950">
                      {report.project_name}
                    </p>
                    <p className="mt-1 text-base text-gray-500">
                      作業日：{formatDate(report.report_date)}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {stats ? (
        <DashboardTodaySchedules schedules={stats.todaySchedules} />
      ) : null}
    </>
  );
}
