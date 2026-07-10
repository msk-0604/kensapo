"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ProjectProgressItem } from "@/types/database";

type GroupedItems = {
  category: string;
  sections: { section: string | null; items: ProjectProgressItem[] }[];
};

function groupItems(items: ProjectProgressItem[]): GroupedItems[] {
  const categoryMap = new Map<string, Map<string | null, ProjectProgressItem[]>>();

  for (const item of items) {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, new Map());
    }
    const sectionMap = categoryMap.get(item.category)!;
    const key = item.section;
    if (!sectionMap.has(key)) sectionMap.set(key, []);
    sectionMap.get(key)!.push(item);
  }

  return Array.from(categoryMap.entries()).map(([category, sectionMap]) => ({
    category,
    sections: Array.from(sectionMap.entries()).map(([section, sectionItems]) => ({
      section,
      items: sectionItems,
    })),
  }));
}

export function ProgressChecklist({
  items: initialItems,
  projectId,
  showPercent = true,
}: {
  items: ProjectProgressItem[];
  projectId: string;
  showPercent?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [savingId, setSavingId] = useState<string | null>(null);

  const completed = items.filter((i) => i.checked).length;
  const percent =
    items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  async function toggleItem(item: ProjectProgressItem) {
    setSavingId(item.id);
    const supabase = createClient();
    const checked = !item.checked;
    const now = new Date().toISOString();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;

    const { error } = await supabase
      .from("project_progress_items")
      .update({
        checked,
        status: checked ? "completed" : "pending",
        checked_at: checked ? now : null,
        checked_by: checked ? userId : null,
        updated_at: now,
      })
      .eq("id", item.id);

    setSavingId(null);

    if (error) {
      window.alert(error.message);
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              checked,
              status: checked ? "completed" : "pending",
              checked_at: checked ? now : null,
            }
          : i
      )
    );
    router.refresh();
  }

  const grouped = groupItems(items);

  return (
    <div className="space-y-6">
      {showPercent ? (
        <section className="rounded-2xl border-2 border-navy-900 bg-navy-900 p-5 text-center text-white">
          <p className="text-base font-bold opacity-90">工事進行状況</p>
          <p className="mt-2 text-5xl font-bold">{percent}%</p>
          <p className="mt-2 text-base opacity-90">
            完了 {completed}件 / 全{items.length}件
          </p>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </section>
      ) : null}

      {grouped.map((group) => (
        <section key={group.category}>
          <h3 className="mb-3 text-lg font-bold text-navy-950">
            {group.category}
          </h3>
          {group.sections.map((sec) => (
            <div key={sec.section ?? "default"} className="mb-4">
              {sec.section ? (
                <h4 className="mb-2 text-base font-bold text-gray-600">
                  {sec.section}
                </h4>
              ) : null}
              <ul className="space-y-2">
                {sec.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItem(item)}
                      disabled={savingId === item.id}
                      className={cn(
                        "flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left text-lg transition-colors",
                        item.checked
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-white active:bg-gray-50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2",
                          item.checked
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-300 bg-white"
                        )}
                      >
                        {item.checked ? (
                          <Check className="h-5 w-5" strokeWidth={3} />
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          item.checked
                            ? "text-green-800 line-through"
                            : "text-navy-950"
                        )}
                      >
                        {item.item_name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
