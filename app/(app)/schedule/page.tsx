import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScheduleWeekNav } from "@/components/schedules/ScheduleWeekNav";
import { ScheduleDayList } from "@/components/schedules/ScheduleDayList";
import { ScheduleDetailsSkeleton } from "@/components/schedules/ScheduleDetailsSkeleton";
import { getCachedProfileWithCompany } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import {
  countSchedulesByDate,
  getSchedulesForDate,
  getSchedulesForRange,
} from "@/lib/schedules";
import { getWorkers } from "@/lib/workers";
import {
  clampDateISO,
  formatDate,
  getWeekDatesISO,
  todayISO,
} from "@/lib/utils";

async function ScheduleDetails({
  selectedDate,
}: {
  selectedDate: string;
}) {
  const profile = await getCachedProfileWithCompany();
  if (!profile) redirect("/login");

  const weekDates = getWeekDatesISO(selectedDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const isToday = selectedDate === todayISO();

  const [schedules, weekSchedules, workers, projects] = await Promise.all([
    getSchedulesForDate(selectedDate),
    getSchedulesForRange(weekStart, weekEnd),
    getWorkers(),
    getProjects(),
  ]);

  const scheduleCounts = countSchedulesByDate(weekSchedules);
  const activeWorkers = workers.filter((w) => w.status === "active");

  return (
    <>
      <ScheduleWeekNav
        selectedDate={selectedDate}
        weekDates={weekDates}
        scheduleCounts={scheduleCounts}
      />

      <section className="mb-6">
        <Link href="/workers">
          <Button variant="secondary" fullWidth size="md">
            作業員の登録・一覧を見る
          </Button>
        </Link>
      </section>

      {schedules.length === 0 && projects.length > 0 ? (
        <EmptyState
          title={
            isToday ? "今日の予定はまだありません" : "この日の予定はありません"
          }
          description="上のボタンから、行動予定を登録できます。"
        />
      ) : null}

      {projects.length === 0 ? (
        <EmptyState
          title="予定を登録する準備ができていません"
          description="現場を先に登録してください。"
          action={
            <Link href="/sites/new">
              <Button fullWidth>現場を登録する</Button>
            </Link>
          }
        />
      ) : (
        <ScheduleDayList
          schedules={schedules}
          companyId={profile.company_id}
          workers={activeWorkers}
          projects={projects}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = clampDateISO(params.date ?? todayISO());
  const isToday = selectedDate === todayISO();

  return (
    <>
      <PageHeader
        title="今日の行動予定"
        description={
          isToday
            ? `今日（${formatDate(selectedDate)}）の予定`
            : `${formatDate(selectedDate)}の予定`
        }
        backHref="/dashboard"
        backLabel="ホームに戻る"
      />

      <section className="mb-6">
        <Link href="/schedule/new">
          <Button fullWidth size="md">
            新しい予定を追加する
          </Button>
        </Link>
      </section>

      <Suspense
        key={selectedDate}
        fallback={<ScheduleDetailsSkeleton />}
      >
        <ScheduleDetails selectedDate={selectedDate} />
      </Suspense>
    </>
  );
}
