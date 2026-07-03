import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/database";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

const statusStyles: Record<ProjectStatus, string> = {
  not_started: "bg-gray-100 text-gray-800 border-gray-300",
  in_progress: "bg-amber-50 text-amber-900 border-amber-300",
  completed: "bg-emerald-50 text-emerald-900 border-emerald-300",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border-2 px-4 py-1 text-base font-bold",
        statusStyles[status]
      )}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
