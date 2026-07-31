import { cache } from "react";
import { readFile } from "fs/promises";
import path from "path";
import type {
  HelpArticle,
  HelpChangelog,
  HelpContact,
  HelpFaq,
  HelpManual,
  HelpVideos,
} from "@/lib/help/types";

const dataDir = path.join(process.cwd(), "public", "help", "data");

async function readJson<T>(fileName: string): Promise<T> {
  const raw = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(raw) as T;
}

export const getManual = cache(async (): Promise<HelpManual> => {
  return readJson<HelpManual>("manual.json");
});

export const getFaq = cache(async (): Promise<HelpFaq> => {
  return readJson<HelpFaq>("faq.json");
});

export const getVideos = cache(async (): Promise<HelpVideos> => {
  return readJson<HelpVideos>("videos.json");
});

export const getContact = cache(async (): Promise<HelpContact> => {
  return readJson<HelpContact>("contact.json");
});

export const getChangelog = cache(async (): Promise<HelpChangelog> => {
  return readJson<HelpChangelog>("changelog.json");
});

export async function getArticle(id: string): Promise<HelpArticle | null> {
  const manual = await getManual();
  return manual.articles.find((a) => a.id === id) ?? null;
}

export async function getAllArticleIds(): Promise<string[]> {
  const manual = await getManual();
  return manual.articles.map((a) => a.id);
}
