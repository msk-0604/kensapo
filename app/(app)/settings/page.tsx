import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ActionLink } from "@/components/ui/ActionLink";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PasskeySettings } from "@/components/auth/PasskeySettings";
import { getProfile, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const ROLE_LABELS: Record<string, string> = {
  admin: "管理者",
  manager: "現場監督",
  worker: "作業員",
};

export default async function SettingsPage() {
  const user = await getSessionUser();
  const profile = await getProfile();
  if (!user || !profile) redirect("/login");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .single();

  return (
    <>
      <PageHeader
        title="設定"
        description="アカウントの確認・変更"
        backHref="/dashboard"
      />

      <section className="mb-8 space-y-4">
        <ActionLink href="/workers" description="作業員の登録・一覧">
          作業員を管理する
        </ActionLink>
        <ActionLink
          href="/ai-reports"
          variant="secondary"
          description="作成済みのAI報告書を見る"
        >
          AI報告書一覧
        </ActionLink>
      </section>

      <section className="space-y-4">
        <PasskeySettings />

        <Card>
          <h2 className="mb-3 text-base font-bold text-gray-600">
            会社情報
          </h2>
          <dl className="space-y-2 text-lg">
            <section>
              <dt className="text-gray-500">会社名</dt>
              <dd className="font-medium text-navy-950">{company?.name}</dd>
            </section>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-bold text-gray-600">
            プロフィール
          </h2>
          <dl className="space-y-2 text-lg">
            <section>
              <dt className="text-gray-500">お名前</dt>
              <dd className="font-medium text-navy-950">{profile.name}</dd>
            </section>
            <section>
              <dt className="text-gray-500">メール</dt>
              <dd className="font-medium">{user.email}</dd>
            </section>
            <section>
              <dt className="text-gray-500">権限</dt>
              <dd className="font-medium">
                {ROLE_LABELS[profile.role] ?? profile.role}
              </dd>
            </section>
          </dl>
        </Card>

        <Card className="!bg-navy-900/5">
          <p className="text-lg text-gray-600">
            KenSapo — 現場の日報・写真・報告書を一元管理
          </p>
        </Card>

        <LogoutButton />
      </section>
    </>
  );
}
