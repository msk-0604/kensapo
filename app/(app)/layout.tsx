import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DbSetupBanner } from "@/components/layout/DbSetupBanner";
import { getCachedProfileWithCompany, getCachedSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  const session = await getCachedSession();
  if (!session?.user) redirect("/login");

  const profile = await getCachedProfileWithCompany();
  const company = profile?.companies;
  const companyName =
    company && !Array.isArray(company)
      ? company.name
      : Array.isArray(company)
        ? company[0]?.name
        : undefined;

  return (
    <AppShell
      userId={session.user.id}
      role={profile?.role}
      userName={profile?.name}
      companyName={companyName}
    >
      <DbSetupBanner />
      {children}
    </AppShell>
  );
}
