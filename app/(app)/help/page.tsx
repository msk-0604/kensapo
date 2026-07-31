import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { HelpHomeClient } from "@/components/help/HelpHomeClient";
import { HelpPrintActions } from "@/components/help/HelpPrintActions";
import { HelpFavoritesList } from "@/components/help/HelpFavoritesList";
import { getManual } from "@/lib/help/load";
import { getProfile } from "@/lib/auth";
import { filterByRole } from "@/lib/help/search";
import type { HelpRole } from "@/lib/help/types";

export default async function HelpPage() {
  const [manual, profile] = await Promise.all([getManual(), getProfile()]);
  const role: HelpRole = profile?.role === "admin" ? "admin" : "member";
  const categories = filterByRole(manual.categories, role);
  const articles = filterByRole(manual.articles, role);

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
              <Link
                href="/help/contact"
                className="font-bold text-navy-900 underline"
              >
                お問い合わせ
              </Link>
              <Link
                href="/help/changelog"
                className="font-bold text-navy-900 underline"
              >
                更新履歴
              </Link>
            </div>
          </div>
        }
      />
      <div className="mb-8">
        <HelpFavoritesList articles={articles} />
      </div>
      <HelpHomeClient categories={categories} articles={articles} />
    </>
  );
}
