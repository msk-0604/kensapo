"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import type { ProgressChartData } from "@/lib/progress";

export function ProgressCharts({ data }: { data: ProgressChartData }) {
  const hasStatus = data.statusChart.length > 0;
  const hasProgress = data.siteProgress.length > 0;
  const hasReports = data.weeklyReports.some((w) => w.count > 0);

  if (!hasStatus && !hasProgress && !hasReports) return null;

  return (
    <section className="mb-8 space-y-6">
      <h2 className="text-lg font-bold text-gray-800">進捗の見える化</h2>

      {hasStatus ? (
        <Card className="!p-5">
          <h3 className="mb-4 text-base font-bold text-gray-600">
            現場の状態
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusChart}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {data.statusChart.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}件`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-4">
            {data.statusChart.map((item) => (
              <li
                key={item.status}
                className="flex items-center gap-2 text-base font-bold"
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}：{item.count}件
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {hasProgress ? (
        <Card className="!p-5">
          <h3 className="mb-4 text-base font-bold text-gray-600">
            現場ごとの進捗（工期ベース）
          </h3>
          <ul className="space-y-4">
            {data.siteProgress.map((site) => (
              <li key={site.id}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/sites/${site.id}`}
                    className="text-base font-bold text-navy-950 underline-offset-2 hover:underline"
                  >
                    {site.name}
                  </Link>
                  <span className="text-base font-bold text-navy-900">
                    {site.percent}%
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-navy-900 transition-all"
                    style={{ width: `${site.percent}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">{site.statusLabel}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {hasReports ? (
        <Card className="!p-5">
          <h3 className="mb-4 text-base font-bold text-gray-600">
            週ごとの日報提出数
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyReports}>
                <XAxis dataKey="label" tick={{ fontSize: 14 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}件`, "日報"]}
                />
                <Bar dataKey="count" fill="#1e3a5f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}
    </section>
  );
}
