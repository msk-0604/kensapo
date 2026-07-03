import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  const user = await getSessionUser();
  redirect(user ? "/dashboard" : "/login");
}
