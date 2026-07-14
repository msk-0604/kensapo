import { redirect } from "next/navigation";

/** 旧・報告書生成画面。日報一覧へ誘導する */
export default async function GenerateReportRedirect({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id } = await params;
  redirect(`/sites/${id}/reports`);
}
