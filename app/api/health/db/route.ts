import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkDbHealth } from "@/lib/supabase/db-health";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "環境変数未設定" });
  }

  try {
    const health = await checkDbHealth();
    return NextResponse.json({
      ok: health.ok,
      message: health.ok ? "OK" : "SQLを実行してください",
    });
  } catch {
    return NextResponse.json({ ok: false, message: "接続エラー" });
  }
}
