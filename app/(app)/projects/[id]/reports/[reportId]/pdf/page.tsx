import { notFound } from "next/navigation";
import { PrintReport } from "@/components/reports/PrintReport";
import { createClient } from "@/lib/supabase/server";
import { getProject } from "@/lib/projects";

export default async function PdfReportPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id, reportId } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (!report?.ai_report) notFound();

  return (
    <PrintReport
      projectName={project.name}
      reportDate={report.report_date}
      content={report.ai_report}
      backHref={`/projects/${id}/reports/${reportId}/generate`}
    />
  );
}
