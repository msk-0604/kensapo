import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { HintBox } from "@/components/ui/HintBox";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getProfile } from "@/lib/auth";
import { getSites } from "@/lib/sites";
import {
  getAllProjectsProgressSummaries,
} from "@/lib/progress-checklist";
import {
  getInProgressSchedulesForToday,
  getSchedulesForDate,
} from "@/lib/schedules";
import { formatDate, formatDateTimeTime, todayISO } from "@/lib/utils";

export default async function ProAdminPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "admin") {
    return (
      <>
        <PageHeader
          title="管理画面"
          description="この画面は管理者だけが使えます"
          backHref="/dashboard"
          backLabel="ホームに戻る"
        />
        <HintBox>
          現場の追加と作業工程の作成は、管理者に依頼してください。
        </HintBox>
        <Link href="/sites" className="mt-6 block">
          <Button fullWidth>現場一覧を見る</Button>
        </Link>
      </>
    );
  }

  const today = todayISO();
  const [sites, progressSummaries, todaySchedules, inProgress] =
    await Promise.all([
      getSites(),
      getAllProjectsProgressSummaries().catch(() => []),
      getSchedulesForDate(today).catch(() => []),
      getInProgressSchedulesForToday().catch(() => []),
    ]);

  const summaryBySite = new Map(
    progressSummaries.map((s) => [s.project_id, s] as const)
  );

  return (
    <>
      <PageHeader
        title="管理画面"
        description="現場登録 → 作業工程作成 → 進捗確認"
        backHref="/dashboard"
        backLabel="ホームに戻る"
      />

      <HintBox>
        <p className="font-bold">管理者の流れ</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-base">
          <li>下で現場を登録する</li>
          <li>その現場の「作業工程を組む」でTODOを作る</li>
          <li>作業者が〇（完了）／△（途中）を押すと進捗が分かる</li>
        </ol>
      </HintBox>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold text-navy-950">
          いまの作業状況（今日）
        </h2>
        {inProgress.length === 0 && todaySchedules.length === 0 ? (
          <Card className="!p-5">
            <p className="text-lg text-gray-600">
              今日の予定はまだありません。予定メニューで作業員の予定を入れると、ここに表示されます。
            </p>
            <Link href="/schedule" className="mt-4 block">
              <Button variant="secondary" fullWidth size="md">
                予定を登録する
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {inProgress.length > 0 ? (
              <Card className="!p-5 border-green-300 bg-green-50">
                <p className="text-base font-bold text-green-800">
                  いま作業中（{inProgress.length}件）
                </p>
                <ul className="mt-3 space-y-3">
                  {inProgress.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl border-2 border-green-200 bg-white px-4 py-3"
                    >
                      <p className="text-base font-bold text-navy-700">
                        {s.project_name}
                      </p>
                      <p className="mt-1 text-xl font-bold text-navy-950">
                        {s.worker_name || "作業員未割当"}
                      </p>
                      <p className="mt-1 text-base text-gray-600">
                        {s.work_content || s.title || "作業内容なし"}
                        {s.actual_start_time
                          ? ` ／ 開始 ${formatDateTimeTime(s.actual_start_time)}`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            <Card className="!p-5">
              <p className="text-base font-bold text-gray-700">
                今日の予定（{todaySchedules.length}件）
              </p>
              <ul className="mt-3 space-y-3">
                {todaySchedules.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <p className="text-base font-bold text-navy-700">
                      {s.project_name}
                    </p>
                    <p className="mt-1 text-xl font-bold text-navy-950">
                      {s.worker_name || "作業員未割当"}
                    </p>
                    <p className="mt-1 text-base text-gray-600">
                      {s.work_content || s.title || "作業内容なし"}
                      {" ／ "}
                      {s.status === "in_progress"
                        ? "作業中"
                        : s.status === "completed"
                          ? "完了"
                          : "予定"}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-navy-950">
          新しい現場を追加する
        </h2>
        <p className="mb-4 text-base text-gray-600">
          登録後は、すぐに「作業工程を組む」画面へ進みます。工程を入れないと進捗は測れません。
        </p>
        <ProjectForm
          companyId={profile.company_id}
          goToProgressAfterCreate
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-navy-950">
          現場ごとの作業工程（{sites.length}）
        </h2>
        {sites.length === 0 ? (
          <p className="text-lg text-gray-600">
            まだ現場がありません。上から登録してください。
          </p>
        ) : (
          <ul className="space-y-4">
            {sites.map((site) => {
              const summary = summaryBySite.get(site.id);
              const hasTodos = (summary?.total ?? 0) > 0;
              return (
                <li key={site.id}>
                  <Card className="!p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-2xl font-bold text-navy-950">
                          {site.name}
                        </p>
                        <p className="mt-2 text-base text-gray-600">
                          {site.address || "住所は未入力"}
                        </p>
                        {site.prime_contractor_name ? (
                          <p className="mt-1 text-base text-gray-500">
                            元請け：{site.prime_contractor_name}
                          </p>
                        ) : null}
                        <p className="mt-1 text-base text-gray-500">
                          工期：{formatDate(site.start_date)} 〜{" "}
                          {formatDate(site.end_date)}
                        </p>
                      </div>
                      <StatusBadge status={site.status} />
                    </div>

                    <div className="mt-4 rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3">
                      {hasTodos ? (
                        <>
                          <p className="text-lg font-bold text-navy-950">
                            工程進捗 {summary?.percent ?? 0}%
                          </p>
                          <p className="mt-1 text-base text-gray-600">
                            完了 {summary?.completed ?? 0}件 / 全
                            {summary?.total ?? 0}件
                          </p>
                          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-navy-900"
                              style={{
                                width: `${summary?.percent ?? 0}%`,
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-amber-800">
                          作業工程がまだありません（進捗を測れません）
                        </p>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <Link href={`/sites/${site.id}/progress`}>
                        <Button fullWidth size="md">
                          {hasTodos
                            ? "作業工程を確認・追加する"
                            : "作業工程を組む（必須）"}
                        </Button>
                      </Link>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href={`/sites/${site.id}`}>
                          <Button variant="secondary" fullWidth size="md">
                            詳細を見る
                          </Button>
                        </Link>
                        <Link href={`/sites/${site.id}/edit`}>
                          <Button variant="secondary" fullWidth size="md">
                            変更する
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <Link href="/schedule">
          <Button variant="secondary" fullWidth>
            予定で「誰が・どこで」を登録する
          </Button>
        </Link>
      </section>
    </>
  );
}
