"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, X } from "lucide-react";
import type { HelpArticle, HelpFaqItem } from "@/lib/help/types";
import { resolveHelpForPath } from "@/lib/help/route-map";
import { searchFaq } from "@/lib/help/search";

export function HelpContextPanel({
  articles,
  faq = [],
}: {
  articles: HelpArticle[];
  faq?: HelpFaqItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const resolved = resolveHelpForPath(pathname);
  const article =
    articles.find((a) => a.id === resolved.articleId) ?? articles[0];

  const relatedFaq = useMemo(() => {
    if (!article) return [];
    return searchFaq(faq, article.title).slice(0, 2);
  }, [article, faq]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/help")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print fixed bottom-[calc(7.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-navy-900 bg-white text-navy-950 shadow-lg hover:bg-navy-900 hover:text-white md:bottom-8"
        aria-label="この画面のヘルプ"
      >
        <CircleHelp className="h-8 w-8" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] no-print" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="閉じる"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l-2 border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b-2 border-gray-200 px-5 py-4">
              <div>
                <p className="text-base font-bold text-navy-700">この画面のヘルプ</p>
                <p className="text-xl font-bold text-navy-950">{resolved.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100"
                aria-label="閉じる"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {article ? (
                <>
                  <p className="text-lg leading-relaxed text-gray-800">
                    {article.summary}
                  </p>
                  <div>
                    <p className="mb-2 text-base font-bold text-gray-600">手順</p>
                    <ol className="list-decimal space-y-2 pl-6 text-lg text-gray-800">
                      {article.steps.slice(0, 4).map((s) => (
                        <li key={s.title}>
                          <span className="font-bold">{s.title}</span>
                          <span className="mt-1 block text-base text-gray-600">
                            {s.body}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {article.notes?.length ? (
                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                      <p className="mb-2 text-base font-bold text-amber-900">
                        注意
                      </p>
                      <ul className="list-disc space-y-1 pl-5 text-base text-amber-950">
                        {article.notes.slice(0, 2).map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="text-lg text-gray-600">
                  関連する説明を読み込み中です。
                </p>
              )}

              {relatedFaq.length > 0 ? (
                <div>
                  <p className="mb-2 text-base font-bold text-gray-600">
                    関連するよくある質問
                  </p>
                  <ul className="space-y-2">
                    {relatedFaq.map((item) => (
                      <li key={item.id}>
                        <Link
                          href="/help/faq"
                          className="block rounded-xl bg-gray-50 px-3 py-3 text-base font-bold text-navy-900"
                          onClick={() => setOpen(false)}
                        >
                          {item.question}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="space-y-3 border-t-2 border-gray-200 p-5">
              <Link
                href={article ? `/help/${article.id}` : "/help"}
                className="flex min-h-[4rem] w-full items-center justify-center rounded-2xl bg-navy-900 px-5 text-xl font-bold text-white"
                onClick={() => setOpen(false)}
              >
                詳しい説明を見る
              </Link>
              <Link
                href="/help"
                className="flex min-h-[4rem] w-full items-center justify-center rounded-2xl border-2 border-gray-300 bg-white px-5 text-xl font-bold text-navy-900"
                onClick={() => setOpen(false)}
              >
                取扱説明書トップ
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
