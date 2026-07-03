import type { ProjectStatus } from "@/types/database";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "\u672a\u7740\u5de5",
  in_progress: "\u4f5c\u696d\u4e2d",
  completed: "\u5b8c\u4e86",
};

export const WEATHER_OPTIONS = [
  "\u6674\u308c",
  "\u66c7\u308a",
  "\u96e8",
  "\u96ea",
  "\u5f37\u98a8",
] as const;

export const STORAGE_BUCKET = "site-photos";
