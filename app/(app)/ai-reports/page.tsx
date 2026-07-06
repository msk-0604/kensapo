import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProfile } from "@/lib/auth";
import { getAiReports } from "@/lib/ai-reports";
import { formatDate } from "@/lib/utils";

export default async function AiReportsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const reports = await getAiReports();

  return (
    <>
      <PageHeader
        title="AI報告書"
        description="作成した報告書の一覧です"
        backHref="/dashboard"
      />

      {reports.length === 0 ? (
        <EmptyState
          title="報告書がまだありません"
          description="現場の日報を書いたあと、「AI報告書を作る」から作成できます。"
          action={
            <Link href="/sites">
              <span className="inline-block w-full rounded-2xl bg-navy-900 px-6 py-4 text-center text-lg font-bold text-white">
                現場を見る
              </span>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/sites/${report.project_id}/reports/${report.id}/generate`}
              >
                <Card className="!p-5">
                  <p className="text-xl font-bold text-navy-950">
                    {report.project_name}
                  </p>
                  <p className="mt-2 text-lg text-gray-600">
                    作業日：{formatDate(report.report_date)}
                  </p>
                  <p className="mt-3 line-clamp-2 text-base text-gray-500">
                    {report.ai_report}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
