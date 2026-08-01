"use client";

import dynamic from "next/dynamic";
import type { ProgressChartData } from "@/lib/progress";

const ProgressCharts = dynamic(
  () =>
    import("@/components/dashboard/ProgressCharts").then((m) => ({
      default: m.ProgressCharts,
    })),
  { ssr: false, loading: () => null }
);

export function DeferredProgressCharts({ data }: { data: ProgressChartData }) {
  return <ProgressCharts data={data} />;
}
