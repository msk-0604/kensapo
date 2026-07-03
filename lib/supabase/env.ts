export function getSupabasePublicEnv():
  | { url: string; anonKey: string }
  | { error: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return {
      error:
        "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。.env.local を作成して Supabase の API キーを設定し、npm run dev を再起動してください。",
    };
  }

  return { url, anonKey };
}
