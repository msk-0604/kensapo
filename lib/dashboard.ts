import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/projects";
import { todayISO } from "@/lib/utils";
import type { DailyReport, SitePhoto } from "@/types/database";

export type DashboardStats = {
  todaySiteCount: number;
  todayWorkerCount: number;
  missingReportCount: number;
  latestPhotos: (SitePhoto & { project_name: string })[];
  latestReports: (DailyReport & { project_name: string })[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const today = todayISO();
  const projects = await getProjects();

  const activeToday = projects.filter((p) => p.status === "in_progress");

  const { count: scheduleCount } = await supabase
    .from("schedules")
    .select("*", { count: "exact", head: true })
    .eq("schedule_date", today);

  const { data: todayReports } = await supabase
    .from("daily_reports")
    .select("project_id")
    .eq("report_date", today);

  const reportedProjectIds = new Set(
    (todayReports ?? []).map((r) => r.project_id)
  );
  const missingReportCount = activeToday.filter(
    (p) => !reportedProjectIds.has(p.id)
  ).length;

  const { data: photosRaw } = await supabase
    .from("site_photos")
    .select("*, projects!inner(name)")
    .order("created_at", { ascending: false })
    .limit(3);

  const latestPhotos = (photosRaw ?? []).map((row) => {
    const p = row as SitePhoto & { projects: { name: string } };
    return {
      ...p,
      project_name: p.projects.name,
    };
  });

  const { data: reportsRaw } = await supabase
    .from("daily_reports")
    .select("*, projects!inner(name)")
    .not("ai_report", "is", null)
    .order("created_at", { ascending: false })
    .limit(3);

  const latestReports = (reportsRaw ?? []).map((row) => {
    const r = row as DailyReport & { projects: { name: string } };
    return {
      ...r,
      project_name: r.projects.name,
    };
  });

  return {
    todaySiteCount: activeToday.length,
    todayWorkerCount: scheduleCount ?? 0,
    missingReportCount,
    latestPhotos,
    latestReports,
  };
}
