import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActionLink } from "@/components/ui/ActionLink";
import { StatusBadge } from "@/components/ui/Badge";
import { SiteProgressBar } from "@/components/sites/SiteProgressBar";
import { SeedProgressButton } from "@/components/progress/SeedProgressButton";
import { getSite } from "@/lib/sites";
import { getSchedulesForProject } from "@/lib/schedules";
import { uniqueWorkerNames } from "@/lib/schedules-group";
import {
  calcProgressSummary,
  getProgressItems,
} from "@/lib/progress-checklist";
import { getSiteProgressPercent } from "@/lib/progress";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayISO } from "@/lib/utils";
import { WorkerNameList } from "@/components/ui/WorkerNameList";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const supabase = await createClient();
  const [profile, photoCountRes, reportCountRes, siteSchedules, progressItems] =
    await Promise.all([
      getProfile(),
      supabase
        .from("site_photos")
        .select("*", { count: "exact", head: true })
        .eq("project_id", id),
      supabase
        .from("daily_reports")
        .select("*", { count: "exact", head: true })
        .eq("project_id", id),
      getSchedulesForProject(id),
      getProgressItems(id).catch(() => []),
    ]);

  const photoCount = photoCountRes.count;
  const reportCount = reportCountRes.count;
  const progressPercent = getSiteProgressPercent(site);
  const today = todayISO();
  const todaySchedules = siteSchedules.filter((s) => s.schedule_date === today);
  const todayWorkers = uniqueWorkerNames(todaySchedules);
  const upcomingWorkers = uniqueWorkerNames(siteSchedules);
  const isAdmin = profile?.role === "admin";
  const checklistSummary =
    progressItems.length > 0 ? calcProgressSummary(progressItems) : null;

  return (
    <>
      <PageHeader
        title={site.name}
        description="この現場の写真や日報を管理します"
        backHref="/sites"
        backLabel="現場一覧に戻る"
      />

      <SiteProgressBar
        site={site}
        percent={progressPercent}
        reportCount={reportCount ?? 0}
      />

      <Card className="mb-8 !p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-800">工事進行状況</h2>
        {checklistSummary ? (
          <>
            <div className="mb-4 text-center">
              <p className="text-4xl font-bold text-navy-950">
                {checklistSummary.percent}%
              </p>
              <p className="mt-1 text-base text-gray-600">
                未完了 {checklistSummary.pending}件 / 全
                {checklistSummary.total}件
              </p>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-navy-900"
                  style={{ width: `${checklistSummary.percent}%` }}
                />
              </div>
            </div>
            <Link href={`/sites/${id}/progress`}>
              <Button fullWidth size="md">
                チェックリストを開く
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="mb-4 text-base text-gray-600">
              紙の工事進行表をスマホでチェックできます。
            </p>
            {isAdmin && profile ? (
              <SeedProgressButton
                projectId={id}
                companyId={profile.company_id}
              />
            ) : null}
          </>
        )}
      </Card>

      <Card className="mb-8">
        <div className="mb-4">
          <StatusBadge status={site.status} />
        </div>
        <dl className="space-y-5 text-base">
          <div>
            <dt className="font-bold text-gray-600">住所</dt>
            <dd className="mt-1 text-lg font-bold text-navy-950">
              {site.address || "未入力"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-gray-600">担当者</dt>
            <dd className="mt-1 text-lg text-navy-950">
              {site.manager_name || "未設定"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-gray-600">元請け先</dt>
            <dd className="mt-1 text-lg text-navy-950">
              {site.prime_contractor_name || "未設定"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-gray-600">工期</dt>
            <dd className="mt-1 text-lg text-navy-950">
              {formatDate(site.start_date)} 〜 {formatDate(site.end_date)}
            </dd>
          </div>
          {site.memo ? (
            <div>
              <dt className="font-bold text-gray-600">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
                {site.memo}
              </dd>
            </div>
          ) : null}
        </dl>
        {isAdmin ? (
          <div className="mt-6 border-t-2 border-gray-100 pt-5">
            <Link href={`/sites/${id}/edit`}>
              <Button variant="secondary" fullWidth size="md">
                現場の情報を変更する
              </Button>
            </Link>
          </div>
        ) : null}
      </Card>

      <Card className="mb-8 !p-5">
        <h2 className="mb-3 text-xl font-bold text-navy-950">この現場の人員</h2>
        <div className="mb-5 rounded-2xl border-2 border-navy-200 bg-navy-900/5 px-4 py-4">
          <p className="mb-2 text-base font-bold text-navy-700">今日の作業員</p>
          <WorkerNameList
            names={todayWorkers}
            emptyLabel="今日の予定に作業員はいません"
          />
        </div>
        {upcomingWorkers.length > 0 ? (
          <div>
            <p className="mb-2 text-base font-bold text-gray-700">
              これから入る予定の作業員
            </p>
            <WorkerNameList names={upcomingWorkers} />
          </div>
        ) : null}
        <div className="mt-5">
          <Link href="/workers">
            <Button variant="secondary" fullWidth size="md">
              作業員の登録・一覧を見る
            </Button>
          </Link>
        </div>
      </Card>

      {siteSchedules.length > 0 ? (
        <Card className="mb-8 !p-5">
          <h2 className="mb-4 text-xl font-bold text-navy-950">
            この現場の予定
          </h2>
          <ul className="space-y-3">
            {siteSchedules.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3"
              >
                <p className="text-base font-bold text-navy-700">
                  {formatDate(s.schedule_date)}
                </p>
                <p className="mt-1 text-xl font-bold text-navy-950">
                  {s.worker_name || "作業員未割当"}
                </p>
                {s.work_content ? (
                  <p className="mt-1 text-base text-gray-600">
                    {s.work_content}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          {isAdmin ? (
            <div className="mt-4">
              <Link href="/schedule">
                <Button variant="secondary" fullWidth size="md">
                  予定を追加・変更する
                </Button>
              </Link>
            </div>
          ) : null}
        </Card>
      ) : (
        <Card className="mb-8 !p-5">
          <h2 className="mb-2 text-xl font-bold text-navy-950">
            この現場の予定
          </h2>
          <p className="mb-4 text-base text-gray-600">
            まだ予定が登録されていません。作業員を割り当てて予定を入れると、ここに名前が表示されます。
          </p>
          {isAdmin ? (
            <Link href="/schedule">
              <Button fullWidth size="md">
                作業員の予定を登録する
              </Button>
            </Link>
          ) : (
            <p className="text-base text-gray-600">
              予定の登録は管理者が行います。
            </p>
          )}
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">この現場でできること</h2>
        <ActionLink
          href={`/sites/${id}/photos`}
          description={`登録済みの写真：${photoCount ?? 0}枚`}
        >
          写真を追加する
        </ActionLink>
        <ActionLink
          href={`/sites/${id}/reports/new`}
          variant="secondary"
          description={`作成済みの日報：${reportCount ?? 0}件`}
        >
          日報を書く
        </ActionLink>
        <ActionLink
          href={`/sites/${id}/reports`}
          variant="secondary"
          description="過去の日報を見る"
        >
          日報一覧を見る
        </ActionLink>
      </section>
    </>
  );
}
