import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";
import { CopySqlButton } from "@/components/setup/CopySqlButton";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkDbHealth } from "@/lib/supabase/db-health";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const setupSql = readFileSync(
    path.join(process.cwd(), "supabase", "setup.sql"),
    "utf-8"
  );

  let ready = false;
  if (isSupabaseConfigured()) {
    try {
      const health = await checkDbHealth();
      ready = health.ok;
    } catch {
      ready = false;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-950">初期設定</h1>

      {ready ? (
        <section className="mt-8 rounded-2xl bg-green-100 p-6 text-center">
          <p className="text-xl font-bold text-green-900">準備完了です</p>
          <Link
            href="/login"
            className="mt-6 inline-block min-h-[4rem] w-full rounded-2xl bg-navy-900 px-6 py-4 text-xl font-bold text-white"
          >
            ログインする
          </Link>
        </section>
      ) : (
        <section className="mt-8 space-y-6">
          <p className="text-lg text-gray-700">
            次の3つだけです。
          </p>
          <ol className="space-y-4 text-lg font-bold text-navy-950">
            <li>1. 下のボタンを押す</li>
            <li>2. Supabaseの SQL Editor に貼る</li>
            <li>3. Run を押す</li>
          </ol>

          <CopySqlButton sql={setupSql} />

          <a
            href="https://supabase.com/dashboard/project/_/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-lg font-bold text-navy-900 underline"
          >
            Supabaseを開く
          </a>

          <p className="text-base text-gray-500">
            Run のあと、このページを更新してください。
          </p>
        </section>
      )}

      {!isSupabaseConfigured() ? (
        <p className="mt-8 text-base text-red-700">
          Vercelに環境変数（SUPABASE_URL と ANON_KEY）も設定してください。
        </p>
      ) : null}
    </main>
  );
}
