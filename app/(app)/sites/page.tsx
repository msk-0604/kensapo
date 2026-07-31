import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { HintBox } from "@/components/ui/HintBox";
import { WorkerNameList } from "@/components/ui/WorkerNameList";
import { getSites } from "@/lib/sites";
import { getSchedulesForDate, workerNamesByProject } from "@/lib/schedules";
import { formatDate, todayISO } from "@/lib/utils";

const INTENT_MESSAGES: Record<string, { title: string; body: string }> = {
  photo: {
    title: "写真を追加する現場を選んでください",
    body: "下の一覧から、写真を撮りたい現場の名前をタップしてください。",
  },
  report: {
    title: "日報を書く現場を選んでください",
    body: "下の一覧から、今日の作業を記録したい現場の名前をタップしてください。",
  },
};

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const [sites, todaySchedules] = await Promise.all([
    getSites(),
    getSchedulesForDate(todayISO()).catch(() => []),
  ]);
  const todayWorkers = workerNamesByProject(todaySchedules);
  const intentMessage = intent ? INTENT_MESSAGES[intent] : null;

  return (
    <>
      <PageHeader
        title="現場一覧"
        description={
          sites.length > 0
            ? `${sites.length}か所の現場が登録されています`
            : "工事の現場をここで管理します"
        }
        backHref="/dashboard"
        backLabel="ホームに戻る"
        action={
          <Link href="/sites/new">
            <Button fullWidth size="md">
              新しい現場を登録する
            </Button>
          </Link>
        }
      />

      {intentMessage ? (
        <HintBox>
          <p className="font-bold">{intentMessage.title}</p>
          <p className="mt-1">{intentMessage.body}</p>
        </HintBox>
      ) : null}

      {sites.length === 0 ? (
        <EmptyState
          title="現場がまだありません"
          description="工事の現場を登録すると、写真の管理や日報の作成ができるようになります。"
          steps={[
            "「新しい現場を登録する」ボタンを押す",
            "現場の名前・住所・担当者などを入力する",
            "登録した現場から、写真や日報を記録する",
          ]}
          action={
            <Link href="/sites/new">
              <Button fullWidth>新しい現場を登録する</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-5">
          {sites.map((site) => {
            const workers = todayWorkers[site.id] ?? [];
            return (
              <li key={site.id}>
                <Link
                  href={
                    intent === "photo"
                      ? `/sites/${site.id}/photos`
                      : intent === "report"
                        ? `/sites/${site.id}/reports/new`
                        : `/sites/${site.id}`
                  }
                  className="tap-press block"
                >
                  <Card className="transition-colors hover:border-navy-700">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-navy-700">現場</p>
                        <h3 className="mt-1 text-2xl font-bold leading-snug text-navy-950">
                          {site.name}
                        </h3>
                        <p className="mt-2 text-base text-gray-600">
                          {site.address || "住所は未入力です"}
                        </p>
                        <p className="mt-2 text-base text-gray-500">
                          現場担当：{site.manager_name || "未設定"}
                        </p>
                        <p className="mt-1 text-base text-gray-500">
                          工期：{formatDate(site.start_date)} 〜{" "}
                          {formatDate(site.end_date)}
                        </p>
                      </div>
                      <StatusBadge status={site.status} />
                    </div>

                    <div className="mt-4 rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="mb-2 text-base font-bold text-gray-700">
                        今日の作業員
                      </p>
                      <WorkerNameList
                        names={workers}
                        emptyLabel="今日の予定・作業員はまだありません"
                      />
                    </div>

                    <p className="mt-4 text-base font-bold text-navy-900">
                      {intent === "photo"
                        ? "この現場に写真を追加する →"
                        : intent === "report"
                          ? "この現場の日報を書く →"
                          : "この現場の詳細を見る →"}
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
