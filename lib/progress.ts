import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/lib/projects";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { addDaysISO, todayISO } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/database";

export type StatusChartItem = {
  label: string;
  count: number;
  status: ProjectStatus;
  color: string;
};

export type SiteProgressItem = {
  id: string;
  name: string;
  percent: number;
  statusLabel: string;
};

export type WeeklyReportItem = {
  label: string;
  count: number;
};

export type ProgressChartData = {
  statusChart: StatusChartItem[];
  siteProgress: SiteProgressItem[];
  weeklyReports: WeeklyReportItem[];
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  not_started: "#94a3b8",
  in_progress: "#2563eb",
  completed: "#16a34a",
};

function calcSiteProgressPercent(site: Project): number {
  if (site.status === "completed") return 100;
  if (site.status === "not_started") return 0;

  if (site.start_date && site.end_date) {
    const start = new Date(`${site.start_date}T12:00:00`).getTime();
    const end = new Date(`${site.end_date}T12:00:00`).getTime();
    const now = new Date(`${todayISO()}T12:00:00`).getTime();
    if (end <= start) return 50;
    const ratio = (now - start) / (end - start);
    return Math.min(100, Math.max(5, Math.round(ratio * 100)));
  }

  return 50;
}

export async function getProgressChartData(): Promise<ProgressChartData> {
  const projects = await getProjects();
  const supabase = await createClient();

  const statusCounts: Record<ProjectStatus, number> = {
    not_started: 0,
    in_progress: 0,
    completed: 0,
  };
  for (const p of projects) {
    statusCounts[p.status]++;
  }

  const statusChart: StatusChartItem[] = (
    Object.keys(statusCounts) as ProjectStatus[]
  )
    .filter((status) => statusCounts[status] > 0)
    .map((status) => ({
      status,
      label: PROJECT_STATUS_LABELS[status],
      count: statusCounts[status],
      color: STATUS_COLORS[status],
    }));

  const siteProgress: SiteProgressItem[] = projects
    .filter((p) => p.status !== "completed")
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      percent: calcSiteProgressPercent(p),
      statusLabel: PROJECT_STATUS_LABELS[p.status],
    }));

  const weeklyReports: WeeklyReportItem[] = [];
  const today = todayISO();
  for (let i = 3; i >= 0; i--) {
    const weekEnd = addDaysISO(today, -i * 7);
    const weekStart = addDaysISO(weekEnd, -6);
    const { count } = await supabase
      .from("daily_reports")
      .select("*", { count: "exact", head: true })
      .gte("report_date", weekStart)
      .lte("report_date", weekEnd);

    const startLabel = new Date(`${weekStart}T12:00:00`).toLocaleDateString(
      "ja-JP",
      { month: "numeric", day: "numeric" }
    );
    weeklyReports.push({
      label: i === 0 ? "今週" : startLabel,
      count: count ?? 0,
    });
  }

  return { statusChart, siteProgress, weeklyReports };
}

export function getSiteProgressPercent(site: Project): number {
  return calcSiteProgressPercent(site);
}
