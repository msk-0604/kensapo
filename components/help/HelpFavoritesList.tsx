"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HelpArticle } from "@/lib/help/types";
import { loadHelpFavorites } from "@/lib/help/favorites";

export function HelpFavoritesList({ articles }: { articles: HelpArticle[] }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(loadHelpFavorites());
    function onStorage() {
      setIds(loadHelpFavorites());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  const items = ids
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is HelpArticle => Boolean(a));

  if (items.length === 0) return null;

  return (
    <section className="no-print">
      <h2 className="mb-3 text-xl font-bold text-navy-950">お気に入り</h2>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id}>
            <Link
              href={`/help/${a.id}`}
              className="block rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-lg font-bold text-navy-950"
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
