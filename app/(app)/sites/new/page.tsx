import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { HintBox } from "@/components/ui/HintBox";
import { getProfile } from "@/lib/auth";

export default async function NewSitePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/sites");

  return (
    <>
      <PageHeader
        title="新しい現場を登録"
        description="工事の現場情報を入力してください"
        backHref="/sites"
        backLabel="現場一覧に戻る"
      />
      <HintBox>
        管理者が現場を登録したあと、工事進行ページで作業工程を作成すると運用を開始できます。
      </HintBox>
      <ProjectForm companyId={profile.company_id} />
    </>
  );
}
