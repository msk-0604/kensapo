import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DbSetupBanner } from "@/components/layout/DbSetupBanner";
import { getCachedSession } from "@/lib/auth";
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

  return (
    <AppShell userId={session.user.id}>
      <DbSetupBanner />
      {children}
    </AppShell>
  );
}
