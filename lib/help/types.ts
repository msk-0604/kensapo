/** KenSapo ヘルプセンター型定義（既存JSONと後方互換） */

/** DB profiles_role_check と同じ */
export type HelpRole = "admin" | "member";

export type HelpMediaKind = "image" | "gif" | "video";

export type HelpMedia = {
  src: string;
  alt?: string;
  kind?: HelpMediaKind;
  caption?: string;
};

export type HelpStep = {
  title: string;
  body: string;
  /** 手順ごとのメディア（未指定時は article.images[i] / media[i] を使用） */
  media?: HelpMedia | string;
};

export type HelpArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  steps: HelpStep[];
  /** 後方互換: 画像パス配列 */
  images?: string[];
  /** 画像・GIF・MP4 */
  media?: HelpMedia[];
  example?: string;
  notes?: string[];
  related?: string[];
  /** 検索用キーワード */
  keywords?: string[];
  /** 表示可能な権限。未指定なら全員 */
  roles?: HelpRole[];
  updatedAt?: string;
};

export type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  href?: string;
  roles?: HelpRole[];
};

export type HelpManual = {
  categories: HelpCategory[];
  articles: HelpArticle[];
};

export type HelpFaqItem = {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
  keywords?: string[];
  roles?: HelpRole[];
};

export type HelpFaq = {
  items: HelpFaqItem[];
};

export type HelpVideo = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  roles?: HelpRole[];
};

export type HelpVideos = {
  videos: HelpVideo[];
};

export type HelpContact = {
  serviceName: string;
  productionUrl: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  lineOrChat: string;
  hours: string;
  tips: string[];
  commonChecks: string[];
  emergencyNote: string;
};

export type HelpChangelogEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  roles?: HelpRole[];
};

export type HelpChangelog = {
  entries: HelpChangelogEntry[];
};

export type HelpSearchHit =
  | { type: "article"; score: number; item: HelpArticle }
  | { type: "faq"; score: number; item: HelpFaqItem }
  | { type: "category"; score: number; item: HelpCategory }
  | { type: "changelog"; score: number; item: HelpChangelogEntry };
