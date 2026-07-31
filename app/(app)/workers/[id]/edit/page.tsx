import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { getProfile } from "@/lib/auth";
import { getWorker } from "@/lib/workers";

export default async function EditWorkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const worker = await getWorker(id);
  if (!worker) notFound();

  return (
    <>
      <PageHeader
        title="作業員の情報を変更"
        description="名前・電話・職種・稼働状況を修正できます"
        backHref="/workers"
        backLabel="作業員一覧に戻る"
      />
      <WorkerForm worker={worker} companyId={profile.company_id} />
    </>
  );
}
