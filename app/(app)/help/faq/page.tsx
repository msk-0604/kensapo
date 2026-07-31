import { PageHeader } from "@/components/ui/PageHeader";
import { HelpFaqClient } from "@/components/help/HelpFaqClient";
import { getFaq } from "@/lib/help/load";
import { getProfile } from "@/lib/auth";
import { filterByRole } from "@/lib/help/search";
import type { HelpRole } from "@/lib/help/types";

export default async function HelpFaqPage() {
  const [faq, profile] = await Promise.all([getFaq(), getProfile()]);
  const role: HelpRole = profile?.role === "admin" ? "admin" : "member";

  return (
    <>
      <PageHeader
        title="よくある質問"
        description="困ったときの答えをまとめました"
        backHref="/help"
        backLabel="取扱説明書に戻る"
      />
      <HelpFaqClient items={filterByRole(faq.items, role)} />
    </>
  );
}
