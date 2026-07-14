"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ScheduleForm } from "@/components/schedules/ScheduleForm";
import { ScheduleCard } from "@/components/schedules/ScheduleCard";
import { notifyCompanyUpdate } from "@/lib/push/client";
import type { Project, Worker } from "@/types/database";
import type { ScheduleWithDetails } from "@/lib/schedules";

export function ScheduleDayList({
  schedules,
  companyId,
  workers,
  projects,
  selectedDate,
}: {
  schedules: ScheduleWithDetails[];
  companyId: string;
  workers: Worker[];
  projects: Project[];
  selectedDate: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<ScheduleWithDetails | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("この予定を削除しますか？")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      window.alert(error.message);
      return;
    }
    const deleted = schedules.find((s) => s.id === id);
    void notifyCompanyUpdate({
      title: "予定を削除しました",
      body: deleted?.title || deleted?.project_name || "予定が削除されました",
      url: "/schedule",
      tag: `schedule-delete-${id}`,
    });
    if (editing?.id === id) setEditing(null);
    router.refresh();
  }

  if (editing) {
    return (
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-gray-800">予定を変更する</h2>
        <ScheduleForm
          companyId={companyId}
          workers={workers}
          projects={projects}
          schedule={editing}
          onCancel={() => setEditing(null)}
        />
      </section>
    );
  }

  return (
    <section className="mb-8">
      {schedules.length > 0 ? (
        <ul className="mb-8 space-y-4">
          {schedules.map((s) => (
            <li key={s.id}>
              <ScheduleCard
                schedule={s}
                onEdit={() => setEditing(s)}
                onDelete={() => handleDelete(s.id)}
                deleting={deletingId === s.id}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          新しい予定を追加する
        </h2>
        <ScheduleForm
          companyId={companyId}
          workers={workers}
          projects={projects}
          defaultDate={selectedDate}
        />
      </section>
    </section>
  );
}
