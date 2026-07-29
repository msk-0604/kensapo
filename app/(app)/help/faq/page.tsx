import { PageHeader } from "@/components/ui/PageHeader";
import { HelpFaqClient } from "@/components/help/HelpFaqClient";
import { getFaq } from "@/lib/help/load";

export default async function HelpFaqPage() {
  const faq = await getFaq();

  return (
    <>
      <PageHeader
        title="よくある質問"
        description="困ったときの答えをまとめました"
        backHref="/help"
        backLabel="取扱説明書に戻る"
      />
      <HelpFaqClient items={faq.items} />
    </>
  );
}
