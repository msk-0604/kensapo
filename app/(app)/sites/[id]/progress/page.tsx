import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressChecklist } from "@/components/progress/ProgressChecklist";
import { SeedProgressButton } from "@/components/progress/SeedProgressButton";
import { HintBox } from "@/components/ui/HintBox";
import { getSite } from "@/lib/sites";
import { getProgressItems } from "@/lib/progress-checklist";
import { getProfile } from "@/lib/auth";
import type { ProjectProgressItem } from "@/types/database";

export default async function SiteProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const profile = await getProfile();
  let items: ProjectProgressItem[] = [];
  try {
    items = await getProgressItems(id);
  } catch {
    items = [];
  }

  return (
    <>
      <PageHeader
        title="工事進行状況"
        description={site.name}
        backHref={`/sites/${id}`}
        backLabel="現場に戻る"
      />

      <HintBox>
        工程は一覧から選んで追加（スマホはタップ、PCはドラッグでも可）。作業後は〇（完了）または△（注意）を押し、最後に備考を書けます。
      </HintBox>

      {profile ? (
        <ProgressChecklist
          items={items}
          projectId={id}
          companyId={profile.company_id}
          initialRemarks={site.progress_remarks ?? ""}
        />
      ) : null}

      {items.length === 0 && profile ? (
        <section className="mt-8 space-y-4">
          <p className="text-base text-gray-600">
            まとめて入れたいときは、標準の工事進行表を一括作成できます。
          </p>
          <SeedProgressButton
            projectId={id}
            companyId={profile.company_id}
          />
        </section>
      ) : null}
    </>
  );
}
