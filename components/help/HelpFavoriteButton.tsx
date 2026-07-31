"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  isHelpFavorite,
  toggleHelpFavorite,
} from "@/lib/help/favorites";
import { cn } from "@/lib/utils";

export function HelpFavoriteButton({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isHelpFavorite(articleId));
  }, [articleId]);

  return (
    <button
      type="button"
      className={cn(
        "no-print inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl border-2 px-4 text-lg font-bold transition-colors",
        on
          ? "border-amber-500 bg-amber-50 text-amber-800"
          : "border-gray-300 bg-white text-navy-900 hover:bg-gray-50"
      )}
      onClick={() => setOn(toggleHelpFavorite(articleId).includes(articleId))}
      aria-pressed={on}
      aria-label={on ? `${title}をお気に入り解除` : `${title}をお気に入り`}
    >
      <Star className={cn("h-5 w-5", on && "fill-amber-500")} aria-hidden />
      {on ? "お気に入り済み" : "お気に入り"}
    </button>
  );
}
