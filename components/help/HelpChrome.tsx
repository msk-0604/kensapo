"use client";

import { useEffect, useMemo, useState } from "react";
import type { HelpArticle, HelpFaqItem, HelpRole } from "@/lib/help/types";
import { HELP_DATA_URLS } from "@/lib/help/paths";
import { filterByRole } from "@/lib/help/search";
import { HelpCommandPalette } from "@/components/help/HelpCommandPalette";
import { HelpContextPanel } from "@/components/help/HelpContextPanel";
import { HelpTour } from "@/components/help/HelpTour";

function asHelpRole(role?: string): HelpRole {
  return role === "admin" ? "admin" : "member";
}

export function HelpChrome({ role }: { role?: string }) {
  const helpRole = asHelpRole(role);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [faq, setFaq] = useState<HelpFaqItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [manualRes, faqRes] = await Promise.all([
          fetch(HELP_DATA_URLS.manual),
          fetch(HELP_DATA_URLS.faq),
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

  const visibleArticles = useMemo(
    () => filterByRole(articles, helpRole),
    [articles, helpRole]
  );
  const visibleFaq = useMemo(
    () => filterByRole(faq, helpRole),
    [faq, helpRole]
  );

  return (
    <>
      <HelpCommandPalette articles={visibleArticles} faq={visibleFaq} />
      <HelpContextPanel articles={visibleArticles} faq={visibleFaq} />
      <HelpTour />
    </>
  );
}
