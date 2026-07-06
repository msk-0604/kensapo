import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { GenerateReport } from "@/components/reports/GenerateReport";
import { getProject } from "@/lib/projects";

export default async function GenerateReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; reportId: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { id, reportId } = await params;
  const { name } = await searchParams;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title="報告書の作成"
        description={`現場名：${name ?? project.name}`}
        backHref={`/sites/${id}`}
        backLabel="現場の画面に戻る"
      />
      <GenerateReport projectId={id} reportId={reportId} />
    </>
  );
}
