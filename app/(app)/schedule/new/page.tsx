import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScheduleForm } from "@/components/schedules/ScheduleForm";
import { getProfile } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import { getWorkers } from "@/lib/workers";
import { todayISO } from "@/lib/utils";

export default async function ScheduleNewPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const [workers, projects] = await Promise.all([
    getWorkers(),
    getProjects(),
  ]);

  return (
    <>
      <PageHeader
        title="予定を追加"
        description="今日の行動予定を登録します"
        backHref="/schedule"
        backLabel="予定一覧に戻る"
      />
      <ScheduleForm
        companyId={profile.company_id}
        workers={workers.filter((w) => w.status === "active")}
        projects={projects}
        defaultDate={todayISO()}
      />
    </>
  );
}
