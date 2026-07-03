import { PageHeader } from "@/components/ui/PageHeader";
import { PhotoUpload } from "@/components/photos/PhotoUpload";
import { getProfile } from "@/lib/auth";
import { getProject } from "@/lib/projects";
import { notFound, redirect } from "next/navigation";

export default async function PhotosPage({
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
        title="写真を追加"
        description={`現場名：${project.name}`}
        backHref={`/projects/${id}`}
        backLabel="現場の画面に戻る"
      />
      <PhotoUpload projectId={id} companyId={profile.company_id} />
    </>
  );
}
