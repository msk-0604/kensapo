import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { DailyReportForm } from "@/components/reports/DailyReportForm";
import { getProject } from "@/lib/projects";

export default async function NewReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title="日報を書く"
        description={`現場名：${project.name}`}
        backHref={`/sites/${id}`}
        backLabel="現場の画面に戻る"
      />
      <DailyReportForm projectId={id} projectName={project.name} />
    </>
  );
}
