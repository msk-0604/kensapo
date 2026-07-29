"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { HelpArticle, HelpFaqItem } from "@/lib/help/types";
import { searchArticles, searchFaq } from "@/lib/help/search";
import { HelpSearchInput } from "@/components/help/HelpSearchInput";

type Props = {
  articles: HelpArticle[];
  faq: HelpFaqItem[];
};

export function HelpCommandPalette({ articles, faq }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  const articleHits = useMemo(
    () => searchArticles(articles, query).slice(0, 6),
    [articles, query]
  );
  const faqHits = useMemo(
    () => searchFaq(faq, query).slice(0, 4),
    [faq, query]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] no-print" role="dialog" aria-modal>
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="閉じる"
        onClick={close}
      />
      <div className="relative mx-auto mt-[10vh] w-[min(100%-1.5rem,36rem)] rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-lg font-bold text-navy-950">
            <Search className="h-5 w-5" aria-hidden />
            ヘルプ検索
          </p>
          <button
            type="button"
            onClick={close}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100"
            aria-label="閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <HelpSearchInput
          value={query}
          onChange={setQuery}
          placeholder="操作や困りごとを検索"
          id="help-cmdk"
        />
        <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto">
          <section>
            <p className="mb-2 text-base font-bold text-gray-600">マニュアル</p>
            <ul className="space-y-2">
              {articleHits.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-gray-50 px-4 py-3 text-left text-lg font-bold text-navy-950 hover:bg-navy-900/10"
                    onClick={() => {
                      close();
                      router.push(`/help/${a.id}`);
                    }}
                  >
                    {a.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <p className="mb-2 text-base font-bold text-gray-600">よくある質問</p>
            <ul className="space-y-2">
              {faqHits.map((item) => (
                <li key={item.id}>
                  <Link
                    href="/help/faq"
                    className="block rounded-xl bg-gray-50 px-4 py-3 text-lg font-bold text-navy-950 hover:bg-navy-900/10"
                    onClick={close}
                  >
                    {item.question}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <p className="text-center text-base text-gray-500">
            Ctrl + K で開閉できます
          </p>
        </div>
      </div>
    </div>
  );
}
