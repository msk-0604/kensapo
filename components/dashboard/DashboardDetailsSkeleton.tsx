import { Card } from "@/components/ui/Card";

export function DashboardDetailsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="grid grid-cols-2 gap-4">
        <Card className="!p-5">
          <div className="mx-auto h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mt-3 h-10 w-12 animate-pulse rounded bg-gray-200" />
        </Card>
        <Card className="!p-5">
          <div className="mx-auto h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mt-3 h-10 w-12 animate-pulse rounded bg-gray-200" />
        </Card>
      </div>
      <Card className="!p-5">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-gray-100" />
      </Card>
    </div>
  );
}
