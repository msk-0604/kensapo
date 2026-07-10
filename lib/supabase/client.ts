import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export function createClientWithConfig(url: string, anonKey: string) {
  return createBrowserClient(url, anonKey);
}

/** 顔認証・指紋ログイン専用（通常ログインとは分離） */
export function createPasskeyClientWithConfig(url: string, anonKey: string) {
  return createBrowserClient(url, anonKey, {
    auth: {
      experimental: { passkey: true },
    },
  });
}

export function createClient() {
  const env = requireSupabasePublicEnv();
  return createClientWithConfig(env.url, env.anonKey);
}

/** 顔認証・指紋ログイン専用（通常ログインとは分離） */
export function createPasskeyClient() {
  const env = requireSupabasePublicEnv();
  return createPasskeyClientWithConfig(env.url, env.anonKey);
}
