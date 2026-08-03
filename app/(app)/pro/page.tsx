import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { HintBox } from "@/components/ui/HintBox";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getProfile } from "@/lib/auth";
import { getSites } from "@/lib/sites";
import { formatDate } from "@/lib/utils";

export default async function ProAdminPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "admin") {
    return (
      <>
        <PageHeader
          title="管理画面"
          description="この画面は管理者だけが使えます"
          backHref="/dashboard"
          backLabel="ホームに戻る"
        />
        <HintBox>
          現場の追加は、管理者に依頼するか、現場メニューから行ってください。
        </HintBox>
        <Link href="/sites" className="mt-6 block">
          <Button fullWidth>現場一覧を見る</Button>
        </Link>
      </>
    );
  }

  const sites = await getSites();

  return (
    <>
      <PageHeader
        title="管理画面"
        description="URL「/pro」からの現場追加・管理"
        backHref="/dashboard"
        backLabel="ホームに戻る"
      />

      <HintBox>
        ここで新しい現場を追加できます。いつもの「現場」メニューからの追加も、これまでどおり使えます。
      </HintBox>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-navy-950">
          新しい現場を追加する
        </h2>
        <ProjectForm
          companyId={profile.company_id}
          successHref="/pro"
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-navy-950">
          登録済みの現場（{sites.length}）
        </h2>
        {sites.length === 0 ? (
          <p className="text-lg text-gray-600">まだ現場がありません。</p>
        ) : (
          <ul className="space-y-4">
            {sites.map((site) => (
              <li key={site.id}>
                <Card className="!p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl font-bold text-navy-950">
                        {site.name}
                      </p>
                      <p className="mt-2 text-base text-gray-600">
                        {site.address || "住所は未入力"}
                      </p>
                      <p className="mt-1 text-base text-gray-500">
                        工期：{formatDate(site.start_date)} 〜{" "}
                        {formatDate(site.end_date)}
                      </p>
                    </div>
                    <StatusBadge status={site.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link href={`/sites/${site.id}`}>
                      <Button variant="secondary" fullWidth size="md">
                        詳細を見る
                      </Button>
                    </Link>
                    <Link href={`/sites/${site.id}/edit`}>
                      <Button variant="secondary" fullWidth size="md">
                        変更する
                      </Button>
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <Link href="/sites">
          <Button variant="secondary" fullWidth>
            通常の現場一覧を開く
          </Button>
        </Link>
      </section>
    </>
  );
}
