import { ActionLink } from "@/components/ui/ActionLink";

export function DashboardQuickActions() {
  return (
    <section className="mb-8 space-y-4">
      <ActionLink href="/schedule" description="今日の作業を確認・開始する">
        今日の予定を見る
      </ActionLink>
      <ActionLink
        href="/sites?intent=photo"
        variant="secondary"
        description="現場の写真を撮って保存する"
      >
        写真を撮る
      </ActionLink>
      <ActionLink
        href="/sites"
        variant="secondary"
        description="登録した工事現場の一覧"
      >
        現場を見る
      </ActionLink>
    </section>
  );
}
