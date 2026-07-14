import { redirect } from "next/navigation";

/** 旧・報告書生成画面。現場の日報一覧相当へ誘導する */
export default async function ProjectGenerateReportRedirect({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id } = await params;
  redirect(`/sites/${id}/reports`);
}
