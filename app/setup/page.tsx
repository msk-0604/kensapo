export default function SetupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-navy-950">環境変数の設定</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Supabase の接続情報がまだ設定されていません。
      </p>

      <section className="mt-6 rounded-2xl border-2 border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-navy-950">ローカル開発の場合</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
          <li>
            <code className="rounded bg-gray-100 px-1">.env.example</code>
            を <code className="rounded bg-gray-100 px-1">.env.local</code>
            にコピーする
          </li>
          <li>Supabase の URL と anon key を記入する</li>
          <li>
            <code>npm run dev</code> を再起動する
          </li>
        </ol>
      </section>

      <section className="mt-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
        <h2 className="text-lg font-bold text-blue-900">
          Vercel（本番）の場合
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-blue-900">
          <li>
            Vercel ダッシュボード → Project → Settings → Environment
            Variables を開く
          </li>
          <li>
            以下の2つを追加する（Production / Preview / Development すべてにチェック）
            <ul className="mt-2 list-disc pl-5 text-blue-800">
              <li>
                <strong>NEXT_PUBLIC_SUPABASE_URL</strong>（Supabase の Project
                URL）
              </li>
              <li>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>（anon public
                キー）
              </li>
            </ul>
          </li>
          <li>保存後、再デプロイする</li>
        </ol>
      </section>

      <section className="mt-4 text-sm text-gray-600">
        <p className="font-bold text-gray-800">Supabase の値の確認方法</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            <a
              href="https://supabase.com/dashboard"
              className="text-navy-900 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase Dashboard
            </a>
            を開く
          </li>
          <li>Project Settings → API から URL と anon public キーをコピー</li>
        </ol>
      </section>

      <p className="mt-8 text-xs text-gray-400">
        設定後は{" "}
        <a href="/login" className="text-navy-900 underline">
          ログイン画面
        </a>
        からアクセスできます。
      </p>
    </main>
  );
}
