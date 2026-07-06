import { createClient } from "@/lib/supabase/server";
import type { Worker } from "@/types/database";

export async function getWorkers(): Promise<Worker[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getWorker(id: string): Promise<Worker | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
