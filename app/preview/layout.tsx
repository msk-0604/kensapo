import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KenSapo レビュー用プレビュー",
  description: "ログイン不要の画面プレビュー（ChatGPT・デザインレビュー用）",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/preview/schedule", label: "予定一覧" },
  { href: "/preview/schedule/detail", label: "予定詳細" },
  { href: "/preview/schedule/new", label: "予定登録" },
  { href: "/preview/schedule/edit", label: "予定編集" },
] as const;

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-200">
      <div className="border-b-2 border-amber-400 bg-amber-50 px-4 py-3 text-center">
        <p className="text-base font-bold text-amber-950">
          レビュー用プレビュー（ログイン不要・データはダミー）
        </p>
        <p className="mt-1 text-sm text-amber-800">
          本番の見た目に近いサンプルです。保存や通知は動きません。
        </p>
        <nav className="mx-auto mt-3 flex max-w-lg flex-wrap justify-center gap-2">
          <Link
            href="/preview"
            className="rounded-xl border-2 border-amber-500 bg-white px-3 py-2 text-sm font-bold text-amber-950"
          >
            目次
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border-2 border-amber-500 bg-white px-3 py-2 text-sm font-bold text-amber-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-gray-50 shadow-xl">
        <header className="sticky top-0 z-40 border-b-2 border-gray-200 bg-white">
          <div className="flex min-h-[4.5rem] items-center justify-between px-5">
            <span className="text-2xl font-bold text-navy-950">KenSapo</span>
            <div className="text-right text-base leading-snug text-gray-700">
              <p className="text-lg font-bold text-gray-900">山田太郎</p>
              <p className="text-base text-gray-600">サンプル建設</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-5 py-8 pb-36">
          {children}
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
          aria-label="メインメニュー（プレビュー）"
        >
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 px-3 pb-3 pt-3">
            {["ホーム", "予定", "現場", "設定"].map((label, i) => (
              <div
                key={label}
                className={`flex min-h-[5rem] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center ${
                  i === 1
                    ? "bg-navy-900 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <span className="text-base font-bold leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
