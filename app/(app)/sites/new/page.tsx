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
        title="????????"
        description="????????????????"
        backHref="/sites"
        backLabel="???????"
      />
      <HintBox>
        ??????????????????????????????????
      </HintBox>
      <ProjectForm companyId={profile.company_id} />
    </>
  );
}
