"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { notifyCompanyUpdate } from "@/lib/push/client";
import { STANDARD_PROGRESS_ITEMS } from "@/lib/standard-progress-items";
import type { ProgressMark, ProjectProgressItem } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { ActionHint } from "@/components/ui/ActionHint";

const REMARKS_MAX = 2000;

type GroupedItems = {
  category: string;
  sections: { section: string | null; items: ProjectProgressItem[] }[];
};

function groupItems(items: ProjectProgressItem[]): GroupedItems[] {
  const categoryMap = new Map<
    string,
    Map<string | null, ProjectProgressItem[]>
  >();

  for (const item of items) {
    if (!item?.id || !item.item_name) continue;
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

function itemKey(category: string, section: string | null, name: string) {
  return `${category}::${section ?? ""}::${name}`;
}

function normalizeMark(value: unknown, checked?: boolean): ProgressMark {
  if (value === "ok" || value === "attention" || value === "none") return value;
  return checked ? "ok" : "none";
}

function friendlyDbError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("mark") ||
    m.includes("progress_remarks") ||
    m.includes("prime_contractor") ||
    m.includes("column")
  ) {
    return "データベースの更新が必要です。supabase/RUN_CUSTOMER_WORKFLOW.sql を実行してください。";
  }
  if (m.includes("check") || m.includes("constraint")) {
    return "保存内容が正しくありません。空欄のまま保存できる項目は空欄でも大丈夫です。もう一度お試しください。";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "通信に失敗しました。電波を確認して、もう一度お試しください。";
  }
  return message || "保存に失敗しました。もう一度お試しください。";
}

export function ProgressChecklist({
  items: initialItems,
  projectId,
  companyId,
  initialRemarks = "",
  showPercent = true,
}: {
  items: ProjectProgressItem[];
  projectId: string;
  companyId: string;
  initialRemarks?: string;
  showPercent?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(() =>
    (initialItems ?? []).map((item) => ({
      ...item,
      mark: normalizeMark(item.mark, item.checked),
      remarks: item.remarks ?? null,
    }))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState(initialRemarks ?? "");
  const [remarksSaving, setRemarksSaving] = useState(false);
  const [remarksMessage, setRemarksMessage] = useState("");
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [bannerError, setBannerError] = useState("");

  const completed = items.filter((i) => normalizeMark(i.mark, i.checked) === "ok")
    .length;
  const attention = items.filter(
    (i) => normalizeMark(i.mark, i.checked) === "attention"
  ).length;
  const percent =
    items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const existingKeys = useMemo(
    () =>
      new Set(
        items.map((i) => itemKey(i.category, i.section, i.item_name))
      ),
    [items]
  );

  const palette = useMemo(
    () =>
      STANDARD_PROGRESS_ITEMS.filter(
        (p) =>
          p.item_name.trim() &&
          !existingKeys.has(itemKey(p.category, p.section, p.item_name))
      ),
    [existingKeys]
  );

  async function setMark(item: ProjectProgressItem, mark: ProgressMark) {
    if (savingId) return;
    setBannerError("");
    setSavingId(item.id);
    const supabase = createClient();
    const now = new Date().toISOString();
    const current = normalizeMark(item.mark, item.checked);
    const nextMark: ProgressMark = current === mark ? "none" : mark;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;
    const checked = nextMark === "ok";

    // status は pending / completed のみ（古い制約でも△が落ちないように）
    const basePayload = {
      checked,
      checked_at: checked ? now : null,
      checked_by: checked ? userId : null,
      updated_at: now,
      status: checked ? ("completed" as const) : ("pending" as const),
      mark: nextMark,
    };

    let { error } = await supabase
      .from("project_progress_items")
      .update(basePayload)
      .eq("id", item.id);

    // mark 列が無い／制約エラー時は従来の checked だけ更新
    if (error) {
      const fallback = await supabase
        .from("project_progress_items")
        .update({
          checked,
          checked_at: checked ? now : null,
          checked_by: checked ? userId : null,
          updated_at: now,
          status: checked ? "completed" : "pending",
        })
        .eq("id", item.id);
      error = fallback.error;
      if (error) {
        setSavingId(null);
        setBannerError(friendlyDbError(error.message));
        return;
      }
    }

    setSavingId(null);

    const label =
      nextMark === "ok" ? "〇" : nextMark === "attention" ? "△" : "未入力";
    void notifyCompanyUpdate({
      title: `工事進行を「${label}」に更新`,
      body: item.item_name,
      url: `/sites/${projectId}/progress`,
      tag: `progress-${item.id}`,
    });

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              mark: nextMark,
              status: checked ? "completed" : "pending",
              checked,
              checked_at: checked ? now : null,
            }
          : i
      )
    );
    router.refresh();
  }

  async function addProcess(process: {
    category: string;
    section: string | null;
    item_name: string;
  }) {
    const name = process.item_name?.trim();
    if (!name || !companyId || !projectId) return;

    const key = itemKey(process.category, process.section, name);
    if (existingKeys.has(key) || addingKey) return;

    setBannerError("");
    setAddingKey(key);
    const supabase = createClient();
    const sortOrder =
      items.reduce((max, i) => Math.max(max, i.sort_order ?? 0), -1) + 1;

    const fullRow = {
      company_id: companyId,
      project_id: projectId,
      category: process.category || "その他",
      section: process.section,
      item_name: name,
      sort_order: sortOrder,
      mark: "none" as const,
      status: "pending" as const,
      checked: false,
    };

    let { data, error } = await supabase
      .from("project_progress_items")
      .insert(fullRow)
      .select("*")
      .single();

    if (error) {
      const { mark: _m, ...withoutMark } = fullRow;
      const retry = await supabase
        .from("project_progress_items")
        .insert(withoutMark)
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    setAddingKey(null);
    if (error || !data) {
      setBannerError(friendlyDbError(error?.message || "工程の追加に失敗しました"));
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        ...data,
        mark: normalizeMark(data.mark, data.checked),
        remarks: data.remarks ?? null,
      } as ProjectProgressItem,
    ]);
    router.refresh();
  }

  async function saveRemarks() {
    if (remarksSaving) return;
    setBannerError("");
    setRemarksMessage("");
    setRemarksSaving(true);
    const supabase = createClient();
    const value = remarks.trim().slice(0, REMARKS_MAX);

    const { error } = await supabase
      .from("projects")
      .update({ progress_remarks: value.length > 0 ? value : null })
      .eq("id", projectId);

    setRemarksSaving(false);
    if (error) {
      setBannerError(friendlyDbError(error.message));
      return;
    }
    setRemarks(value);
    setRemarksMessage(
      value.length > 0 ? "備考を保存しました" : "備考を空欄で保存しました"
    );
    router.refresh();
  }

  const grouped = groupItems(items);

  return (
    <div className="space-y-8">
      {bannerError ? (
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-lg text-red-700">
          {bannerError}
        </p>
      ) : null}

      {showPercent ? (
        <section className="rounded-2xl border-2 border-navy-900 bg-navy-900 p-5 text-center text-white">
          <p className="text-base font-bold opacity-90">工事進行状況</p>
          <p className="mt-2 text-5xl font-bold">{percent}%</p>
          <p className="mt-2 text-base opacity-90">
            〇 {completed}件 / △ {attention}件 / 全{items.length}件
          </p>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </section>
      ) : null}

      <section
        className={cn(
          "rounded-2xl border-2 border-dashed p-4 transition-colors",
          dropActive
            ? "border-navy-900 bg-navy-900/5"
            : "border-gray-300 bg-white"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDropActive(false);
          const raw = e.dataTransfer.getData("application/kensapo-process");
          if (!raw) return;
          try {
            const process = JSON.parse(raw) as {
              category: string;
              section: string | null;
              item_name: string;
            };
            if (process?.item_name?.trim()) void addProcess(process);
          } catch {
            // ignore bad drag payload
          }
        }}
      >
        <h2 className="text-lg font-bold text-navy-950">この現場の作業工程</h2>
        <p className="mt-1 text-base text-gray-600">
          下の一覧から選んで追加できます。パソコンならドラッグ＆ドロップでも追加できます。
        </p>

        {items.length === 0 ? (
          <p className="mt-4 text-lg text-gray-500">
            まだ工程がありません。下から追加してください。
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {grouped.map((group) => (
              <div key={group.category}>
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
                    <ul className="space-y-3">
                      {sec.items.map((item) => {
                        const mark = normalizeMark(item.mark, item.checked);
                        return (
                          <li
                            key={item.id}
                            className="rounded-2xl border-2 border-gray-200 bg-white p-4"
                          >
                            <p className="text-xl font-bold text-navy-950">
                              {item.item_name}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                disabled={savingId === item.id}
                                onClick={() => void setMark(item, "ok")}
                                className={cn(
                                  "tap-press min-h-[4.5rem] rounded-2xl border-2 text-3xl font-bold",
                                  mark === "ok"
                                    ? "border-green-600 bg-green-600 text-white"
                                    : "border-green-300 bg-green-50 text-green-800"
                                )}
                              >
                                〇
                              </button>
                              <button
                                type="button"
                                disabled={savingId === item.id}
                                onClick={() => void setMark(item, "attention")}
                                className={cn(
                                  "tap-press min-h-[4.5rem] rounded-2xl border-2 text-3xl font-bold",
                                  mark === "attention"
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-amber-300 bg-amber-50 text-amber-800"
                                )}
                              >
                                △
                              </button>
                            </div>
                            <ActionHint>
                              〇＝完了　△＝注意・未完了　もう一度押すと取り消せます
                            </ActionHint>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold text-navy-950">
          作業工程を追加する
        </h2>
        <p className="mt-1 text-base text-gray-600">
          毎回打たなくて大丈夫です。一覧をタップ（またはドラッグ）して追加します。
        </p>
        {palette.length === 0 ? (
          <p className="mt-4 text-base text-gray-500">
            追加できる標準工程はすべて入っています。
          </p>
        ) : (
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {palette.map((process) => {
              const key = itemKey(
                process.category,
                process.section,
                process.item_name
              );
              const label = process.section
                ? `${process.category} / ${process.section} / ${process.item_name}`
                : `${process.category} / ${process.item_name}`;
              return (
                <li key={key}>
                  <button
                    type="button"
                    draggable
                    disabled={addingKey === key}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/kensapo-process",
                        JSON.stringify(process)
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => void addProcess(process)}
                    className="tap-press flex min-h-[3.5rem] w-full items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-left text-base font-bold text-navy-950 active:bg-navy-900 active:text-white"
                  >
                    {addingKey === key ? "追加中…" : `＋ ${label}`}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-bold text-navy-950">備考</h2>
        <Textarea
          label="詳細・申し送り（任意・空欄でも保存できます）"
          value={remarks}
          onChange={(e) =>
            setRemarks(e.target.value.slice(0, REMARKS_MAX))
          }
          rows={4}
          maxLength={REMARKS_MAX}
          placeholder="例：明日は資材搬入あり。△の箇所は要再確認。"
        />
        <div className="mt-4">
          <Button
            type="button"
            fullWidth
            loading={remarksSaving}
            onClick={() => void saveRemarks()}
          >
            備考を保存する
          </Button>
          <ActionHint>空欄のまま保存してもエラーになりません</ActionHint>
          {remarksMessage ? (
            <p className="mt-3 text-center text-base font-bold text-green-700">
              {remarksMessage}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
