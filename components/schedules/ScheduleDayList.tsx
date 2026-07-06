"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScheduleForm } from "@/components/schedules/ScheduleForm";
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
        <ul className="mb-8 space-y-3">
          {schedules.map((s) => (
            <li key={s.id}>
              <Card className="!p-5">
                <p className="text-lg font-bold text-navy-950">
                  {s.worker_name} → {s.project_name}
                </p>
                {s.work_content ? (
                  <p className="mt-2 text-base text-gray-600">
                    {s.work_content}
                  </p>
                ) : null}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => setEditing(s)}
                  >
                    変更
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    fullWidth
                    loading={deletingId === s.id}
                    onClick={() => handleDelete(s.id)}
                  >
                    削除
                  </Button>
                </div>
              </Card>
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
