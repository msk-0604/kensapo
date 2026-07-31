import type {
  HelpArticle,
  HelpCategory,
  HelpChangelogEntry,
  HelpFaqItem,
  HelpRole,
  HelpSearchHit,
} from "@/lib/help/types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[　]/g, "");
}

/** 既存UI・取説で使う語のゆれを吸収（推測の新機能名は入れない） */
const SYNONYMS: Record<string, string[]> = {
  ホーム: ["ダッシュボード", "home", "dashboard"],
  ダッシュボード: ["ホーム"],
  現場: ["サイト", "プロジェクト", "sites", "projects"],
  予定: ["スケジュール", "schedule"],
  スケジュール: ["予定"],
  作業員: ["ワーカー", "workers"],
  日報: ["レポート", "reports"],
  写真: ["フォト", "photos", "カメラ"],
  通知: ["プッシュ", "notification", "お知らせ"],
  設定: ["settings", "プロフィール"],
  工事進行: ["進捗", "チェックリスト", "progress"],
  ログイン: ["サインイン", "認証"],
  取扱説明書: ["ヘルプ", "マニュアル", "help"],
};

function expandQueryTokens(query: string): string[] {
  const base = normalize(query.trim());
  if (!base) return [];
  const tokens = new Set<string>([base]);
  for (const [key, alts] of Object.entries(SYNONYMS)) {
    const nk = normalize(key);
    if (base.includes(nk) || nk.includes(base)) {
      tokens.add(nk);
      for (const a of alts) tokens.add(normalize(a));
    }
    for (const a of alts) {
      const na = normalize(a);
      if (base.includes(na) || na.includes(base)) {
        tokens.add(nk);
        tokens.add(na);
      }
    }
  }
  return [...tokens];
}

function scoreBlob(blob: string, tokens: string[]): number {
  const n = normalize(blob);
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    if (n === t) score += 20;
    else if (n.startsWith(t)) score += 12;
    else if (n.includes(t)) score += 8;
  }
  return score;
}

export function filterByRole<T extends { roles?: HelpRole[] }>(
  items: T[],
  role: HelpRole | string | null | undefined
): T[] {
  const r = role === "admin" || role === "member" ? role : "member";
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(r);
  });
}

export function searchArticles(
  articles: HelpArticle[],
  query: string
): HelpArticle[] {
  const tokens = expandQueryTokens(query);
  if (tokens.length === 0) return articles;
  return articles
    .map((a) => {
      const blob = [
        a.title,
        a.category,
        a.summary,
        a.content,
        a.example ?? "",
        ...(a.notes ?? []),
        ...(a.keywords ?? []),
        ...a.steps.map((s) => `${s.title} ${s.body}`),
      ].join(" ");
      return { a, score: scoreBlob(blob, tokens) };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);
}

export function searchCategories(
  categories: HelpCategory[],
  query: string
): HelpCategory[] {
  const tokens = expandQueryTokens(query);
  if (tokens.length === 0) return categories;
  return categories
    .map((c) => ({
      c,
      score: scoreBlob(`${c.title} ${c.description}`, tokens),
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.c);
}

export function searchFaq(items: HelpFaqItem[], query: string): HelpFaqItem[] {
  const tokens = expandQueryTokens(query);
  if (tokens.length === 0) return items;
  return items
    .map((item) => ({
      item,
      score: scoreBlob(
        `${item.question} ${item.answer} ${(item.tags ?? []).join(" ")} ${(item.keywords ?? []).join(" ")}`,
        tokens
      ),
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.item);
}

export function searchChangelog(
  entries: HelpChangelogEntry[],
  query: string
): HelpChangelogEntry[] {
  const tokens = expandQueryTokens(query);
  if (tokens.length === 0) return entries;
  return entries
    .map((e) => ({
      e,
      score: scoreBlob(`${e.date} ${e.title} ${e.body}`, tokens),
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.e);
}

/** 横断検索（コマンドパレット用） */
export function searchHelpAll(input: {
  query: string;
  articles: HelpArticle[];
  faq: HelpFaqItem[];
  categories: HelpCategory[];
  changelog?: HelpChangelogEntry[];
}): HelpSearchHit[] {
  const tokens = expandQueryTokens(input.query);
  if (tokens.length === 0) return [];

  const hits: HelpSearchHit[] = [];

  for (const a of input.articles) {
    const score = scoreBlob(
      [
        a.title,
        a.category,
        a.summary,
        a.content,
        ...(a.keywords ?? []),
        ...a.steps.map((s) => `${s.title} ${s.body}`),
      ].join(" "),
      tokens
    );
    if (score > 0) hits.push({ type: "article", score, item: a });
  }
  for (const item of input.faq) {
    const score = scoreBlob(
      `${item.question} ${item.answer} ${(item.tags ?? []).join(" ")}`,
      tokens
    );
    if (score > 0) hits.push({ type: "faq", score, item });
  }
  for (const c of input.categories) {
    const score = scoreBlob(`${c.title} ${c.description}`, tokens);
    if (score > 0) hits.push({ type: "category", score, item: c });
  }
  for (const e of input.changelog ?? []) {
    const score = scoreBlob(`${e.date} ${e.title} ${e.body}`, tokens);
    if (score > 0) hits.push({ type: "changelog", score, item: e });
  }

  return hits.sort((a, b) => b.score - a.score);
}

export function detectMediaKind(src: string): "image" | "gif" | "video" {
  const lower = src.toLowerCase().split("?")[0] ?? src;
  if (lower.endsWith(".mp4") || lower.endsWith(".webm")) return "video";
  if (lower.endsWith(".gif")) return "gif";
  return "image";
}
