/** 画面パス → ヘルプ記事ID（既存ルートから確認したパスのみ） */
export const HELP_ROUTE_MAP: {
  match: RegExp;
  articleId: string;
  label: string;
}[] = [
  { match: /^\/dashboard/, articleId: "dashboard", label: "ホームの使い方" },
  { match: /^\/schedule/, articleId: "schedule", label: "予定の使い方" },
  {
    match: /^\/sites\/[^/]+\/photos/,
    articleId: "photos",
    label: "写真の使い方",
  },
  {
    match: /^\/sites\/[^/]+\/reports/,
    articleId: "reports",
    label: "日報の使い方",
  },
  {
    match: /^\/sites\/[^/]+\/progress/,
    articleId: "progress",
    label: "工事進行の使い方",
  },
  { match: /^\/sites\/new/, articleId: "sites", label: "現場の登録方法" },
  { match: /^\/sites\/[^/]+\/edit/, articleId: "sites", label: "現場の編集方法" },
  { match: /^\/sites\/[^/]+$/, articleId: "sites", label: "現場詳細の使い方" },
  { match: /^\/sites/, articleId: "sites", label: "現場の使い方" },
  {
    match: /^\/projects\/[^/]+\/photos/,
    articleId: "photos",
    label: "写真の使い方",
  },
  {
    match: /^\/projects\/[^/]+\/reports/,
    articleId: "reports",
    label: "日報の使い方",
  },
  { match: /^\/projects/, articleId: "sites", label: "現場の使い方" },
  { match: /^\/workers/, articleId: "workers", label: "作業員の使い方" },
  { match: /^\/settings/, articleId: "profile", label: "設定の使い方" },
  { match: /^\/help\/faq/, articleId: "getting-started", label: "よくある質問" },
  { match: /^\/help/, articleId: "getting-started", label: "操作マニュアル" },
];

export function resolveHelpForPath(pathname: string): {
  articleId: string;
  label: string;
} {
  for (const item of HELP_ROUTE_MAP) {
    if (item.match.test(pathname)) {
      return { articleId: item.articleId, label: item.label };
    }
  }
  return { articleId: "getting-started", label: "操作マニュアル" };
}

export const TOUR_STORAGE_KEY = "kensapo-help-tour-v1";
