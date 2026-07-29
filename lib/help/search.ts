import type { HelpArticle, HelpCategory, HelpFaqItem } from "@/lib/help/types";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

export function searchArticles(
  articles: HelpArticle[],
  query: string
): HelpArticle[] {
  const q = normalize(query.trim());
  if (!q) return articles;
  return articles.filter((a) => {
    const blob = normalize(
      [
        a.title,
        a.category,
        a.summary,
        a.content,
        a.example ?? "",
        ...(a.notes ?? []),
        ...a.steps.map((s) => `${s.title} ${s.body}`),
      ].join(" ")
    );
    return blob.includes(q);
  });
}

export function searchCategories(
  categories: HelpCategory[],
  query: string
): HelpCategory[] {
  const q = normalize(query.trim());
  if (!q) return categories;
  return categories.filter((c) =>
    normalize(`${c.title} ${c.description}`).includes(q)
  );
}

export function searchFaq(items: HelpFaqItem[], query: string): HelpFaqItem[] {
  const q = normalize(query.trim());
  if (!q) return items;
  return items.filter((item) =>
    normalize(
      `${item.question} ${item.answer} ${(item.tags ?? []).join(" ")}`
    ).includes(q)
  );
}
