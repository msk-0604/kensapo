"use client";

import { useMemo, useState } from "react";
import type { HelpFaqItem } from "@/lib/help/types";
import { HelpSearchInput } from "@/components/help/HelpSearchInput";
import { HelpPrintActions } from "@/components/help/HelpPrintActions";
import { searchFaq } from "@/lib/help/search";
import { Card } from "@/components/ui/Card";

export function HelpFaqClient({ items }: { items: HelpFaqItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => searchFaq(items, query), [items, query]);

  return (
    <div className="help-print-area space-y-6">
      <div className="no-print flex flex-col gap-4">
        <HelpPrintActions title="よくある質問" />
        <HelpSearchInput
          value={query}
          onChange={setQuery}
          placeholder="質問をキーワードで検索"
          id="faq-search"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border-2 border-gray-200 bg-white p-5 text-lg text-gray-600">
          一致する質問が見つかりませんでした。
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => (
            <li key={item.id}>
              <Card>
                <h2 className="text-xl font-bold text-navy-950">
                  Q. {item.question}
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-gray-800">
                  A. {item.answer}
                </p>
                {item.tags?.length ? (
                  <p className="mt-3 text-base text-gray-500">
                    {item.tags.join(" / ")}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
