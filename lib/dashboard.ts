import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/projects";
import { todayISO } from "@/lib/utils";
import type { DailyReport, Project, SitePhoto } from "@/types/database";
import type { ScheduleWithDetails } from "@/lib/schedules";
import {
  getInProgressSchedulesForToday,
  getSchedulesForDate,
} from "@/lib/schedules";
import { getAllProjectsProgressSummaries } from "@/lib/progress-checklist";

export type DashboardStats = {
  todaySiteCount: number;
  todayWorkerCount: number;
  missingReportCount: number;
  pendingChecklistCount: number;
  latestPhotos: (SitePhoto & { project_name: string })[];
  latestReports: (DailyReport & { project_name: string })[];
  todaySchedules: ScheduleWithDetails[];
  inProgressSchedules: ScheduleWithDetails[];
  siteProgressSummaries: Awaited<
    ReturnType<typeof getAllProjectsProgressSummaries>
  >;
};

export async function getDashboardStats(
  projects?: Project[]
): Promise<DashboardStats> {
  const supabase = await createClient();
  const today = todayISO();
  const projectList = projects ?? (await getProjects());
  const activeToday = projectList.filter((p) => p.status === "in_progress");

  const [
    { count: scheduleCount },
    { data: todayReports },
    { data: photosRaw },
    { data: reportsRaw },
    todaySchedules,
    inProgressSchedules,
    siteProgressSummaries,
  ] = await Promise.all([
    supabase
      .from("schedules")
      .select("*", { count: "exact", head: true })
      .eq("schedule_date", today),
    supabase.from("daily_reports").select("project_id").eq("report_date", today),
    supabase
      .from("site_photos")
      .select("*, projects!inner(name)")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("daily_reports")
      .select("*, projects!inner(name)")
      .not("ai_report", "is", null)
      .order("created_at", { ascending: false })
      .limit(3),
    getSchedulesForDate(today).catch(() => [] as ScheduleWithDetails[]),
    getInProgressSchedulesForToday().catch(() => [] as ScheduleWithDetails[]),
    getAllProjectsProgressSummaries().catch(() => []),
  ]);

  const reportedProjectIds = new Set(
    (todayReports ?? []).map((r) => r.project_id)
  );
  const missingReportCount = activeToday.filter(
    (p) => !reportedProjectIds.has(p.id)
  ).length;

  const latestPhotos = (photosRaw ?? []).map((row) => {
    const p = row as SitePhoto & { projects: { name: string } };
    return {
      ...p,
      project_name: p.projects.name,
    };
  });

  const latestReports = (reportsRaw ?? []).map((row) => {
    const r = row as DailyReport & { projects: { name: string } };
    return {
      ...r,
      project_name: r.projects.name,
    };
  });

  const pendingChecklistCount = siteProgressSummaries.reduce(
    (sum, s) => sum + s.pending,
    0
  );

  return {
    todaySiteCount: activeToday.length,
    todayWorkerCount: scheduleCount ?? 0,
    missingReportCount,
    pendingChecklistCount,
    latestPhotos,
    latestReports,
    todaySchedules,
    inProgressSchedules,
    siteProgressSummaries,
  };
}
