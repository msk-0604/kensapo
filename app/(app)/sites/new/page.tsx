import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { HintBox } from "@/components/ui/HintBox";
import { getProfile } from "@/lib/auth";

export default async function NewSitePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <>
      <PageHeader
        title="新しい現場を登録"
        description="工事の現場情報を入力してください"
        backHref="/sites"
        backLabel="現場一覧に戻る"
      />
      <HintBox>
        現場の名前と住所を入力すれば、すぐに写真や日報の記録を始められます。
      </HintBox>
      <ProjectForm companyId={profile.company_id} />
    </>
  );
}
