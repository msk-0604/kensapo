import { redirect } from "next/navigation";

export default async function SiteReportPdfRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/sites/${id}/reports`);
}
