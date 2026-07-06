"use client";

import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import type { Project } from "@/types/database";

export function SiteProgressBar({
  site,
  percent,
  reportCount,
}: {
  site: Project;
  percent: number;
  reportCount: number;
}) {
  return (
    <Card className="mb-8 !p-5">
      <h2 className="mb-4 text-lg font-bold text-gray-800">進捗状況</h2>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base font-bold text-gray-600">
          {PROJECT_STATUS_LABELS[site.status]}
        </span>
        <span className="text-2xl font-bold text-navy-950">{percent}%</span>
      </div>
      <div className="h-5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-navy-900"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-base text-gray-500">
        日報 {reportCount}件 / 工期から自動計算
      </p>
    </Card>
  );
}
