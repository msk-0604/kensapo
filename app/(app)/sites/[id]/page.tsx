import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActionLink } from "@/components/ui/ActionLink";
import { StatusBadge } from "@/components/ui/Badge";
import { getSite } from "@/lib/sites";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

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
        title={site.name}
        description="この現場の写真や日報を管理します"
        backHref="/sites"
        backLabel="現場一覧に戻る"
      />

      <Card className="mb-8">
        <div className="mb-4">
          <StatusBadge status={site.status} />
        </div>
        <dl className="space-y-5 text-base">
          <div>
            <dt className="font-bold text-gray-600">住所</dt>
            <dd className="mt-1 text-lg font-bold text-navy-950">
              {site.address || "未入力"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-gray-600">担当者</dt>
            <dd className="mt-1 text-lg text-navy-950">
              {site.manager_name || "未設定"}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-gray-600">工期</dt>
            <dd className="mt-1 text-lg text-navy-950">
              {formatDate(site.start_date)} 〜 {formatDate(site.end_date)}
            </dd>
          </div>
          {site.memo ? (
            <div>
              <dt className="font-bold text-gray-600">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
                {site.memo}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 border-t-2 border-gray-100 pt-5">
          <Link href={`/sites/${id}/edit`}>
            <Button variant="secondary" fullWidth size="md">
              現場の情報を変更する
            </Button>
          </Link>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">この現場でできること</h2>
        <ActionLink
          href={`/sites/${id}/photos`}
          description={`登録済みの写真：${photoCount ?? 0}枚`}
        >
          写真を追加する
        </ActionLink>
        <ActionLink
          href={`/sites/${id}/reports/new`}
          variant="secondary"
          description={`作成済みの日報：${reportCount ?? 0}件`}
        >
          日報を書く
        </ActionLink>
        <ActionLink
          href={`/sites/${id}/reports`}
          variant="secondary"
          description="過去の日報と報告書を見る"
        >
          日報一覧を見る
        </ActionLink>
      </section>
    </>
  );
}
