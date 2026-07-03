import { createClient } from "@/lib/supabase/server";

export async function requireApiUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, profile: null as null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id, name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { supabase, user, profile: null };
  }

  return { supabase, user, profile };
}
