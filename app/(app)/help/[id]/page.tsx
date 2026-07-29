import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpArticleView } from "@/components/help/HelpArticleView";
import { getAllArticleIds, getArticle, getManual } from "@/lib/help/load";

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
  const article = await getArticle(id);
  if (!article) notFound();

  const manual = await getManual();
  const related = (article.related ?? [])
    .map((rid) => manual.articles.find((a) => a.id === rid))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

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
