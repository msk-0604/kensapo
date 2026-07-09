import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DbSetupBanner } from "@/components/layout/DbSetupBanner";
import { getProfile, getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkDbHealth } from "@/lib/supabase/db-health";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();

  let dbOk = true;
  try {
    const health = await checkDbHealth();
    dbOk = health.ok;
  } catch {
    dbOk = false;
  }

  return (
    <AppShell userName={profile.name} companyName={company?.name}>
      <DbSetupBanner show={!dbOk} />
      {children}
    </AppShell>
  );
}
