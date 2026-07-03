import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActionLink } from "@/components/ui/ActionLink";
import { StatusBadge } from "@/components/ui/Badge";
import { getProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const { count: photoCount } = await supabase
    .from("site_photos")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id);

  const { count: reportCount } = await supabase
    .from("daily_reports")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id);

  return (
    <>
      <PageHeader
        title={project.name}
        description="この現場の写真や日報を管理します"
        backHref="/projects"
        backLabel="現場一覧に戻る"
      />

      <Card className="mb-8">
        <div className="mb-4">
          <StatusBadge status={project.status} />
        </div>
        <dl className="space-y-5 text-base">
          <div>
            <dt className="font-bold text-gray-600">住所</dt>
            <dd className="mt-1 text-lg font-bold text-navy-950">
              {project.address || "未入力"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-gray-600">担当者</dt>
            <dd className="mt-1 text-lg text-navy-950">
              {project.manager_name || "未設定"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-gray-600">工期</dt>
            <dd className="mt-1 text-lg text-navy-950">
              {formatDate(project.start_date)} 〜{" "}
              {formatDate(project.end_date)}
            </dd>
          </div>
          {project.memo ? (
            <div>
              <dt className="font-bold text-gray-600">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
                {project.memo}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 border-t-2 border-gray-100 pt-5">
          <Link href={`/projects/${id}/edit`}>
            <Button variant="secondary" fullWidth size="md">
              現場の情報を変更する
            </Button>
          </Link>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">この現場でできること</h2>
        <ActionLink
          href={`/projects/${id}/photos`}
          description={`登録済みの写真：${photoCount ?? 0}枚`}
        >
          写真を追加する
        </ActionLink>
        <ActionLink
          href={`/projects/${id}/reports/new`}
          variant="secondary"
          description={`作成済みの日報：${reportCount ?? 0}件`}
        >
          日報を書く
        </ActionLink>
      </section>
    </>
  );
}
