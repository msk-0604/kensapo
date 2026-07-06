import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScheduleForm } from "@/components/schedules/ScheduleForm";
import { getProfile } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import { getSchedulesForDate } from "@/lib/schedules";
import { getWorkers } from "@/lib/workers";
import { formatDate, todayISO } from "@/lib/utils";

export default async function SchedulePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const today = todayISO();
  const [schedules, workers, projects] = await Promise.all([
    getSchedulesForDate(today),
    getWorkers(),
    getProjects(),
  ]);

  return (
    <>
      <PageHeader
        title="作業員予定"
        description={`今日（${formatDate(today)}）の予定`}
        backHref="/dashboard"
        backLabel="ホームに戻る"
      />

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          今日の現場割り当て（{schedules.length}件）
        </h2>
        {schedules.length === 0 ? (
          <EmptyState
            title="今日の予定はまだありません"
            description="下のフォームから、誰がどの現場に行くか登録してください。"
          />
        ) : (
          <ul className="space-y-3">
            {schedules.map((s) => (
              <li key={s.id}>
                <Card className="!p-5">
                  <p className="text-lg font-bold text-navy-950">
                    {s.worker_name} → {s.project_name}
                  </p>
                  {s.work_content ? (
                    <p className="mt-2 text-base text-gray-600">
                      {s.work_content}
                    </p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <Link href="/workers">
          <Button variant="secondary" fullWidth size="md">
            作業員の登録・一覧を見る
          </Button>
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          新しい予定を登録する
        </h2>
        <ScheduleForm
          companyId={profile.company_id}
          workers={workers.filter((w) => w.status === "active")}
          projects={projects}
        />
      </section>
    </>
  );
}
