/**
 * Supabase 公開環境変数の取得。
 *
 * 読み取り元（Next.js 標準）:
 * - ローカル: .env.local / .env
 * - Vercel: Project Settings → Environment Variables
 * - その他 CI: 実行環境の process.env
 *
 * .env.local 専用の実装ではありません。
 */

export const SUPABASE_ENV_KEYS = {
  url: "NEXT_PUBLIC_SUPABASE_URL",
  anonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
} as const;

export const SUPABASE_ENV_SETUP_MESSAGE =
  "Supabase の環境変数が未設定です。ローカルでは .env.local に、Vercel では Project Settings → Environment Variables に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。";

export function getSupabasePublicEnv():
  | { url: string; anonKey: string }
  | null {
  const url = process.env[SUPABASE_ENV_KEYS.url]?.trim();
  const anonKey = process.env[SUPABASE_ENV_KEYS.anonKey]?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}

export function requireSupabasePublicEnv(): {
  url: string;
  anonKey: string;
} {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(SUPABASE_ENV_SETUP_MESSAGE);
  }
  return env;
}
