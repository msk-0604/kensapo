import { createClient } from "@/lib/supabase/server";
import type { DailyReport } from "@/types/database";

export type AiReportListItem = DailyReport & { project_name: string };

export async function getAiReports(): Promise<AiReportListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("daily_reports")
    .select("*, projects!inner(name)")
    .not("ai_report", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as DailyReport & { projects: { name: string } };
    return {
      ...r,
      project_name: r.projects.name,
    };
  });
}
