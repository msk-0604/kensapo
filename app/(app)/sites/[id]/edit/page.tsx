import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getProfile } from "@/lib/auth";
import { getProject } from "@/lib/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title="現場の情報を変更"
        description={`現場名：${project.name}`}
        backHref={`/sites/${id}`}
        backLabel="現場の画面に戻る"
      />
      <ProjectForm project={project} companyId={profile.company_id} />
    </>
  );
}
