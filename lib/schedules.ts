import { createClient } from "@/lib/supabase/server";
import type { Schedule } from "@/types/database";
import { todayISO } from "@/lib/utils";

export type ScheduleWithDetails = Schedule & {
  worker_name: string | null;
  project_name: string;
};

function mapScheduleRow(
  row: Schedule & {
    workers: { name: string } | null;
    projects: { name: string };
  }
): ScheduleWithDetails {
  return {
    ...row,
    worker_id: row.worker_id,
    client_company_name: row.client_company_name ?? null,
    location: row.location ?? null,
    title: row.title ?? null,
    scheduled_start_time: row.scheduled_start_time ?? null,
    scheduled_end_time: row.scheduled_end_time ?? null,
    actual_start_time: row.actual_start_time ?? null,
    actual_end_time: row.actual_end_time ?? null,
    memo: row.memo ?? null,
    status: row.status ?? "scheduled",
    updated_at: row.updated_at ?? row.created_at,
    worker_name: row.workers?.name ?? null,
    project_name: row.projects.name,
  };
}

const SCHEDULE_SELECT = `
  *,
  workers(name),
  projects!inner(name)
`;

export async function getSchedulesForDate(
  date: string = todayISO()
): Promise<ScheduleWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select(SCHEDULE_SELECT)
    .eq("schedule_date", date)
    .order("scheduled_start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapScheduleRow(
      row as Schedule & {
        workers: { name: string } | null;
        projects: { name: string };
      }
    )
  );
}

export async function getUpcomingSchedules(
  limit = 20
): Promise<ScheduleWithDetails[]> {
  const supabase = await createClient();
  const today = todayISO();
  const { data, error } = await supabase
    .from("schedules")
    .select(SCHEDULE_SELECT)
    .gte("schedule_date", today)
    .order("schedule_date", { ascending: true })
    .order("scheduled_start_time", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapScheduleRow(
      row as Schedule & {
        workers: { name: string } | null;
        projects: { name: string };
      }
    )
  );
}

export async function getSchedulesForRange(
  startDate: string,
  endDate: string
): Promise<ScheduleWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select(SCHEDULE_SELECT)
    .gte("schedule_date", startDate)
    .lte("schedule_date", endDate)
    .order("schedule_date", { ascending: true })
    .order("scheduled_start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapScheduleRow(
      row as Schedule & {
        workers: { name: string } | null;
        projects: { name: string };
      }
    )
  );
}

export function countSchedulesByDate(
  schedules: ScheduleWithDetails[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of schedules) {
    counts[s.schedule_date] = (counts[s.schedule_date] ?? 0) + 1;
  }
  return counts;
}

export async function getSchedulesForProject(
  projectId: string,
  fromDate?: string
): Promise<ScheduleWithDetails[]> {
  const supabase = await createClient();
  const start = fromDate ?? todayISO();
  const { data, error } = await supabase
    .from("schedules")
    .select(SCHEDULE_SELECT)
    .eq("project_id", projectId)
    .gte("schedule_date", start)
    .order("schedule_date", { ascending: true })
    .limit(14);

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapScheduleRow(
      row as Schedule & {
        workers: { name: string } | null;
        projects: { name: string };
      }
    )
  );
}

export async function getInProgressSchedulesForToday(): Promise<
  ScheduleWithDetails[]
> {
  const supabase = await createClient();
  const today = todayISO();
  const { data, error } = await supabase
    .from("schedules")
    .select(SCHEDULE_SELECT)
    .eq("schedule_date", today)
    .eq("status", "in_progress")
    .order("scheduled_start_time", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) =>
    mapScheduleRow(
      row as Schedule & {
        workers: { name: string } | null;
        projects: { name: string };
      }
    )
  );
}
