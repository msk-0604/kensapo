import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HelpArticleView } from "@/components/help/HelpArticleView";
import { getAllArticleIds, getArticle, getManual } from "@/lib/help/load";
import { getProfile } from "@/lib/auth";
import { filterByRole } from "@/lib/help/search";
import type { HelpRole } from "@/lib/help/types";

export async function generateStaticParams() {
  const ids = await getAllArticleIds();
  return ids.map((id) => ({ id }));
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, profile] = await Promise.all([getArticle(id), getProfile()]);
  if (!article) notFound();

  const role: HelpRole = profile?.role === "admin" ? "admin" : "member";
  if (article.roles?.length && !article.roles.includes(role)) {
    redirect("/help");
  }

  const manual = await getManual();
  const related = filterByRole(
    (article.related ?? [])
      .map((rid) => manual.articles.find((a) => a.id === rid))
      .filter((a): a is NonNullable<typeof a> => Boolean(a)),
    role
  );

  return (
    <>
      <Link
        href="/help"
        className="no-print mb-5 flex min-h-[4rem] w-full items-center justify-center rounded-2xl border-2 border-gray-300 bg-white px-5 text-xl font-bold text-navy-900 transition-colors hover:bg-gray-50"
      >
        ← 取扱説明書に戻る
      </Link>
      <HelpArticleView article={article} related={related} />
      <p className="no-print mt-8 text-center">
        <Link href="/help" className="text-lg font-bold text-navy-900 underline">
          マニュアル一覧へ
        </Link>
      </p>
    </>
  );
}
