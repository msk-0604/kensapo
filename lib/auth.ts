import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const getCachedSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

export const getCachedProfileWithCompany = cache(async () => {
  const session = await getCachedSession();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, companies(name)")
    .eq("id", session.user.id)
    .single();

  return data as
    | (Profile & { companies: { name: string } | null })
    | null;
});

export async function getSessionUser() {
  const session = await getCachedSession();
  return session?.user ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const profile = await getCachedProfileWithCompany();
  return profile;
}
