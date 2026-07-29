export type HelpStep = {
  title: string;
  body: string;
};

export type HelpArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  steps: HelpStep[];
  images: string[];
  example?: string;
  notes?: string[];
  related?: string[];
};

export type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  href?: string;
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
};

export type HelpFaq = {
  items: HelpFaqItem[];
};

export type HelpVideo = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
};

export type HelpVideos = {
  videos: HelpVideo[];
};
