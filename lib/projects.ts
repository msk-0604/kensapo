import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectStatus } from "@/types/database";

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export type ProjectFormData = {
  name: string;
  address: string;
  manager_name: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  memo: string;
};
