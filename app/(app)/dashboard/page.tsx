import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActionLink } from "@/components/ui/ActionLink";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProjects } from "@/lib/projects";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const projects = await getProjects();
  const active = projects.filter((p) => p.status === "in_progress");
  const recent = projects.slice(0, 3);

  return (
    <>
      <PageHeader
        title="ホーム"
        description="今日やることを選んでください"
      />

      {projects.length === 0 ? (
        <EmptyState
          title="現場がまだ登録されていません"
          description="まずは工事の現場を登録してください。登録が終わると、写真の追加や日報の作成ができるようになります。"
          steps={[
            "下のボタンを押して、現場の名前と住所を入力する",
            "登録した現場を開いて、写真や日報を記録する",
          ]}
          action={
            <Link href="/projects/new">
              <Button fullWidth>新しい現場を登録する</Button>
            </Link>
          }
        />
      ) : (
        <>
          <section className="mb-8 space-y-4">
            <ActionLink href="/projects" description="登録した現場の一覧を見る">
              現場を見る
            </ActionLink>
            <ActionLink
              href="/projects?intent=photo"
              variant="secondary"
              description="現場を選んで写真を撮る・追加する"
            >
              写真を追加
            </ActionLink>
            <ActionLink
              href="/projects?intent=report"
              variant="secondary"
              description="現場を選んで今日の作業を記録する"
            >
              日報を書く
            </ActionLink>
          </section>

          <section className="mb-8 grid grid-cols-2 gap-4">
            <Card className="!p-5 text-center">
              <p className="text-base font-bold text-gray-600">作業中の現場</p>
              <p className="mt-2 text-4xl font-bold text-amber-700">
                {active.length}
              </p>
              <p className="mt-1 text-base text-gray-500">か所</p>
            </Card>
            <Card className="!p-5 text-center">
              <p className="text-base font-bold text-gray-600">登録した現場</p>
              <p className="mt-2 text-4xl font-bold text-navy-950">
                {projects.length}
              </p>
              <p className="mt-1 text-base text-gray-500">か所</p>
            </Card>
          </section>

          {recent.length > 0 ? (
            <section>
              <h2 className="mb-4 text-lg font-bold text-gray-800">
                最近使った現場
              </h2>
              <ul className="space-y-4">
                {recent.map((project) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.id}`}>
                      <Card className="transition-colors hover:border-navy-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-navy-950">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-base text-gray-600">
                              {project.address || "住所は未入力です"}
                            </p>
                            <p className="mt-2 text-base text-gray-500">
                              {formatDate(project.start_date)} 〜{" "}
                              {formatDate(project.end_date)}
                            </p>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>
                        <p className="mt-4 text-base font-bold text-navy-900">
                          この現場を開く →
                        </p>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
