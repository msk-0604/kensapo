import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressChecklist } from "@/components/progress/ProgressChecklist";
import { SeedProgressButton } from "@/components/progress/SeedProgressButton";
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

      {items.length === 0 ? (
        <section className="space-y-6">
          <p className="text-lg leading-relaxed text-gray-600">
            チェック項目がまだありません。下のボタンで標準の工事進行表を作成できます。
          </p>
          {profile ? (
            <SeedProgressButton
              projectId={id}
              companyId={profile.company_id}
            />
          ) : null}
        </section>
      ) : (
        <ProgressChecklist items={items} projectId={id} />
      )}
    </>
  );
}
