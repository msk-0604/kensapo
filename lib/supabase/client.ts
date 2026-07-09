import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = requireSupabasePublicEnv();
  return createBrowserClient(env.url, env.anonKey);
}

/** 顔認証・指紋ログイン専用（通常ログインとは分離） */
export function createPasskeyClient() {
  const env = requireSupabasePublicEnv();
  return createBrowserClient(env.url, env.anonKey, {
    auth: {
      experimental: { passkey: true },
    },
  });
}
