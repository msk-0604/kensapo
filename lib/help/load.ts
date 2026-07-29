import { readFile } from "fs/promises";
import path from "path";
import type { HelpArticle, HelpFaq, HelpManual, HelpVideos } from "@/lib/help/types";

const dataDir = path.join(process.cwd(), "public", "help", "data");

async function readJson<T>(fileName: string): Promise<T> {
  const raw = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(raw) as T;
}

export async function getManual(): Promise<HelpManual> {
  return readJson<HelpManual>("manual.json");
}

export async function getFaq(): Promise<HelpFaq> {
  return readJson<HelpFaq>("faq.json");
}

export async function getVideos(): Promise<HelpVideos> {
  return readJson<HelpVideos>("videos.json");
}

export async function getArticle(id: string): Promise<HelpArticle | null> {
  const manual = await getManual();
  return manual.articles.find((a) => a.id === id) ?? null;
}

export async function getAllArticleIds(): Promise<string[]> {
  const manual = await getManual();
  return manual.articles.map((a) => a.id);
}
