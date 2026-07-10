import { createClient } from "@/lib/supabase/server";
import { STANDARD_PROGRESS_ITEMS } from "@/lib/standard-progress-items";
import type { ProjectProgressItem } from "@/types/database";

export type ProgressSummary = {
  total: number;
  completed: number;
  pending: number;
  percent: number;
};

export function calcProgressSummary(
  items: Pick<ProjectProgressItem, "checked">[]
): ProgressSummary {
  const total = items.length;
  const completed = items.filter((i) => i.checked).length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pending, percent };
}

export async function getProgressItems(
  projectId: string
): Promise<ProjectProgressItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_progress_items")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProgressSummary(
  projectId: string
): Promise<ProgressSummary> {
  const items = await getProgressItems(projectId);
  return calcProgressSummary(items);
}

export async function getAllProjectsProgressSummaries(): Promise<
  (ProgressSummary & { project_id: string; project_name: string })[]
> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("project_progress_items")
    .select("checked, project_id, projects!inner(id, name, status)")
    .neq("projects.status", "completed");

  if (error) throw error;

  const grouped = new Map<
    string,
    { project_name: string; checked: boolean[] }
  >();

  for (const row of rows ?? []) {
    const projectRaw = row.projects as
      | { id: string; name: string }
      | { id: string; name: string }[];
    const project = Array.isArray(projectRaw) ? projectRaw[0] : projectRaw;
    if (!project) continue;
    const existing = grouped.get(row.project_id) ?? {
      project_name: project.name,
      checked: [],
    };
    existing.checked.push(row.checked);
    grouped.set(row.project_id, existing);
  }

  return Array.from(grouped.entries()).map(([project_id, value]) => ({
    project_id,
    project_name: value.project_name,
    ...calcProgressSummary(value.checked.map((checked) => ({ checked }))),
  }));
}

export async function getTodayCompletedProgressItems(
  projectId: string,
  date: string
): Promise<ProjectProgressItem[]> {
  const supabase = await createClient();
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from("project_progress_items")
    .select("*")
    .eq("project_id", projectId)
    .eq("checked", true)
    .gte("checked_at", start)
    .lte("checked_at", end)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function seedStandardProgressItems(
  projectId: string,
  companyId: string
): Promise<{ created: number; skipped: boolean }> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("project_progress_items")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (count && count > 0) {
    return { created: 0, skipped: true };
  }

  const rows = STANDARD_PROGRESS_ITEMS.map((item, index) => ({
    company_id: companyId,
    project_id: projectId,
    category: item.category,
    section: item.section,
    item_name: item.item_name,
    sort_order: index,
  }));

  const { error } = await supabase.from("project_progress_items").insert(rows);
  if (error) throw error;

  return { created: rows.length, skipped: false };
}
