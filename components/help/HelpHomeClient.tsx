"use client";

import { useMemo, useState } from "react";
import type { HelpCategory, HelpArticle } from "@/lib/help/types";
import { HelpSearchInput } from "@/components/help/HelpSearchInput";
import { HelpCategoryCards } from "@/components/help/HelpCategoryCards";
import { searchArticles, searchCategories } from "@/lib/help/search";
import Link from "next/link";

export function HelpHomeClient({
  categories,
  articles,
}: {
  categories: HelpCategory[];
  articles: HelpArticle[];
}) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(
    () => searchCategories(categories, query),
    [categories, query]
  );
  const filteredArticles = useMemo(
    () => searchArticles(articles, query),
    [articles, query]
  );

  const showArticleHits = query.trim().length > 0;

  return (
    <div className="space-y-8">
      <HelpSearchInput value={query} onChange={setQuery} />

      {showArticleHits ? (
        <section>
          <h2 className="mb-3 text-xl font-bold text-navy-950">
            検索結果（{filteredArticles.length}件）
          </h2>
          {filteredArticles.length === 0 ? (
            <p className="rounded-2xl border-2 border-gray-200 bg-white p-5 text-lg text-gray-600">
              「{query}」に一致する説明は見つかりませんでした。
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredArticles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/help/${a.id}`}
                    className="block rounded-2xl border-2 border-gray-200 bg-white p-5 transition-colors hover:border-navy-700"
                  >
                    <p className="text-base font-bold text-navy-700">
                      {a.category}
                    </p>
                    <p className="text-xl font-bold text-navy-950">{a.title}</p>
                    <p className="mt-1 text-base text-gray-600">{a.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-bold text-navy-950">カテゴリから探す</h2>
        <HelpCategoryCards
          categories={showArticleHits ? filteredCategories : categories}
        />
      </section>
    </div>
  );
}
