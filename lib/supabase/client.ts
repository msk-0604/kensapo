import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabasePublicEnv();
  if ("error" in env) {
    throw new Error(env.error);
  }
  return createBrowserClient(env.url, env.anonKey);
}
