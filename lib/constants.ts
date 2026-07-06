import type { ProjectStatus, ScheduleStatus, WorkerStatus } from "@/types/database";

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: "予定",
  in_progress: "作業中",
  completed: "完了",
  cancelled: "取消",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "予定",
  in_progress: "進行中",
  completed: "完了",
};

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  active: "稼働中",
  inactive: "休止中",
};

export const TRADE_OPTIONS = [
  "大工",
  "鳶",
  "電気",
  "設備",
  "塗装",
  "左官",
  "その他",
] as const;

export const WEATHER_OPTIONS = [
  "晴れ",
  "曇り",
  "雨",
  "雪",
  "強風",
] as const;

export const STORAGE_BUCKET = "site-photos";
