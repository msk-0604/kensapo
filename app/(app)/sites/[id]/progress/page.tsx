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
  const isAdmin = profile?.role === "admin";
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
        {isAdmin
          ? "管理者が作業工程（TODO）を作成し、作業者が〇/△で進捗を更新します。最後に備考へ詳細を書けます。"
          : "管理者が作った作業工程に対して、作業者は〇（完了）か△（途中・注意）を押して進捗を記録します。"}
      </HintBox>

      {profile ? (
        <ProgressChecklist
          items={items}
          projectId={id}
          companyId={profile.company_id}
          initialRemarks={site.progress_remarks?.trim() ?? ""}
          canManageItems={isAdmin}
        />
      ) : (
        <p className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-lg text-amber-900">
          ログイン情報を確認できませんでした。一度ログアウトして、もう一度ログインしてください。
        </p>
      )}

      {items.length === 0 && profile && isAdmin ? (
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
