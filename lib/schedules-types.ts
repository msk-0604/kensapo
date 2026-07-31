import type { Schedule } from "@/types/database";

export type ScheduleWithDetails = Schedule & {
  worker_name: string | null;
  project_name: string;
};
