import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getProfile, getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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

  return (
    <AppShell userName={profile.name} companyName={company?.name}>
      {children}
    </AppShell>
  );
}
