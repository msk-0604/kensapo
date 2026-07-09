import { createClient } from "@/lib/supabase/server";

export async function checkDbHealth(): Promise<{ ok: boolean }> {
  const supabase = await createClient();

  const { error: e1 } = await supabase
    .from("companies")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  const { error: e2 } = await supabase
    .from("project_progress_items")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  return { ok: !e1 && !e2 };
}
