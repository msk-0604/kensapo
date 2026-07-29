"use client";

import { useEffect, useState } from "react";
import type { HelpArticle, HelpFaqItem } from "@/lib/help/types";
import { HelpCommandPalette } from "@/components/help/HelpCommandPalette";
import { HelpContextPanel } from "@/components/help/HelpContextPanel";
import { HelpTour } from "@/components/help/HelpTour";

export function HelpChrome() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [faq, setFaq] = useState<HelpFaqItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [manualRes, faqRes] = await Promise.all([
          fetch("/help/data/manual.json"),
          fetch("/help/data/faq.json"),
        ]);
        if (!manualRes.ok || !faqRes.ok) return;
        const manual = (await manualRes.json()) as { articles: HelpArticle[] };
        const faqData = (await faqRes.json()) as { items: HelpFaqItem[] };
        if (cancelled) return;
        setArticles(manual.articles ?? []);
        setFaq(faqData.items ?? []);
      } catch {
        // ヘルプ補助UIが無くても本体は使える
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <HelpCommandPalette articles={articles} faq={faq} />
      <HelpContextPanel articles={articles} />
      <HelpTour />
    </>
  );
}
