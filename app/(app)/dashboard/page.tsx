import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardDetails } from "@/components/dashboard/DashboardDetails";
import { DashboardDetailsSkeleton } from "@/components/dashboard/DashboardDetailsSkeleton";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="ホーム" description="やりたいことを押してください" />
      <DashboardQuickActions />
      <Suspense fallback={<DashboardDetailsSkeleton />}>
        <DashboardDetails />
      </Suspense>
    </>
  );
}
