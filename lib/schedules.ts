import { createClient } from "@/lib/supabase/server";
import type { Schedule } from "@/types/database";
import { todayISO } from "@/lib/utils";

export type ScheduleWithDetails = Schedule & {
  worker_name: string;
  project_name: string;
};

export async function getSchedulesForDate(
  date: string = todayISO()
): Promise<ScheduleWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select(
      `
      *,
      workers!inner(name),
      projects!inner(name)
    `
    )
    .eq("schedule_date", date)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as Schedule & {
      workers: { name: string };
      projects: { name: string };
    };
    return {
      ...r,
      worker_name: r.workers.name,
      project_name: r.projects.name,
    };
  });
}

export async function getUpcomingSchedules(
  limit = 20
): Promise<ScheduleWithDetails[]> {
  const supabase = await createClient();
  const today = todayISO();
  const { data, error } = await supabase
    .from("schedules")
    .select(
      `
      *,
      workers!inner(name),
      projects!inner(name)
    `
    )
    .gte("schedule_date", today)
    .order("schedule_date", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as Schedule & {
      workers: { name: string };
      projects: { name: string };
    };
    return {
      ...r,
      worker_name: r.workers.name,
      project_name: r.projects.name,
    };
  });
}
