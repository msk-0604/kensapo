import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DbSetupBanner } from "@/components/layout/DbSetupBanner";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*, companies(name)")
    .eq("id", user.id)
    .single();
  if (!profileRow) redirect("/login");

  const profile = profileRow as typeof profileRow & {
    companies: { name: string } | null;
  };
  const companyName = profile.companies?.name;

  return (
    <AppShell userName={profile.name} companyName={companyName}>
      <DbSetupBanner />
      {children}
    </AppShell>
  );
}
