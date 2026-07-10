import { Card } from "@/components/ui/Card";

export function ScheduleDetailsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Card key={index} className="!p-3">
            <div className="mx-auto h-4 w-8 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto mt-2 h-6 w-6 animate-pulse rounded-full bg-gray-200" />
          </Card>
        ))}
      </div>
      <Card className="!p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-gray-100" />
      </Card>
    </div>
  );
}
