import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = requireSupabasePublicEnv();
  return createBrowserClient(env.url, env.anonKey);
}
