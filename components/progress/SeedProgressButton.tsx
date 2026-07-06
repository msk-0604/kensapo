"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SeedProgressButton({
  projectId,
  companyId,
}: {
  projectId: string;
  companyId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSeed() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { count } = await supabase
        .from("project_progress_items")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (count && count > 0) {
        setMessage("すでにチェック項目があります。");
        return;
      }

      const rows = (await import("@/lib/standard-progress-items")).STANDARD_PROGRESS_ITEMS.map(
        (item, index) => ({
          company_id: companyId,
          project_id: projectId,
          category: item.category,
          section: item.section,
          item_name: item.item_name,
          sort_order: index,
        })
      );

      const { error } = await supabase
        .from("project_progress_items")
        .insert(rows);
      if (error) throw error;

      setMessage(`${rows.length}件の標準項目を作成しました。`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" fullWidth loading={loading} onClick={handleSeed}>
        標準チェック項目を作成する
      </Button>
      {message ? (
        <p className="mt-3 text-base text-gray-600">{message}</p>
      ) : null}
    </div>
  );
}

/** クライアントから新規現場作成後に呼ぶ */
export async function seedProgressItemsClient(
  projectId: string,
  companyId: string
): Promise<void> {
  const supabase = (await import("@/lib/supabase/client")).createClient();
  const { STANDARD_PROGRESS_ITEMS } = await import(
    "@/lib/standard-progress-items"
  );

  const { count } = await supabase
    .from("project_progress_items")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (count && count > 0) return;

  const rows = STANDARD_PROGRESS_ITEMS.map((item, index) => ({
    company_id: companyId,
    project_id: projectId,
    category: item.category,
    section: item.section,
    item_name: item.item_name,
    sort_order: index,
  }));

  await supabase.from("project_progress_items").insert(rows);
}
