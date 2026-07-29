import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { HelpHomeClient } from "@/components/help/HelpHomeClient";
import { HelpPrintActions } from "@/components/help/HelpPrintActions";
import { getManual } from "@/lib/help/load";

export default async function HelpPage() {
  const manual = await getManual();

  return (
    <>
      <PageHeader
        title="KenSapo 操作マニュアル"
        description="操作方法をいつでも確認できます"
        backHref="/settings"
        backLabel="設定に戻る"
        action={
          <div className="no-print space-y-3">
            <HelpPrintActions title="操作マニュアル" />
            <div className="flex flex-wrap gap-3 text-base">
              <Link
                href="/help/faq"
                className="font-bold text-navy-900 underline"
              >
                よくある質問
              </Link>
              <Link
                href="/help/videos"
                className="font-bold text-navy-900 underline"
              >
                動画マニュアル
              </Link>
            </div>
          </div>
        }
      />
      <HelpHomeClient
        categories={manual.categories}
        articles={manual.articles}
      />
    </>
  );
}
