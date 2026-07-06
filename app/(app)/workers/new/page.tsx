import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { getProfile } from "@/lib/auth";

export default async function NewWorkerPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <>
      <PageHeader
        title="作業員を登録"
        description="現場に割り当てる作業員の情報を入力してください"
        backHref="/workers"
        backLabel="作業員一覧に戻る"
      />
      <WorkerForm companyId={profile.company_id} />
    </>
  );
}
