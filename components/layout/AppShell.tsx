"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "ホーム" },
  { href: "/sites", label: "現場" },
  { href: "/schedule", label: "予定" },
  { href: "/settings", label: "設定" },
];

export function AppShell({
  children,
  userName,
  companyName,
}: {
  children: React.ReactNode;
  userName?: string;
  companyName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isPrintView = pathname.includes("/pdf");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (isPrintView) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-6">{children}</main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b-2 border-gray-200 bg-white">
        <div className="mx-auto flex min-h-[4rem] max-w-lg items-center justify-between px-5">
          <Link href="/dashboard" className="text-xl font-bold text-navy-950">
            ケンサポ
          </Link>
          <div className="text-right text-base leading-snug text-gray-600">
            <p className="font-bold text-gray-800">{userName}</p>
            <p className="text-sm">{companyName}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8">{children}</main>

      <nav className="sticky bottom-0 border-t-2 border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg flex-wrap items-stretch gap-1 px-2 py-2">
          {navItems.map(({ href, label }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-[4.5rem] flex-1 items-center justify-center rounded-xl px-1 py-3 text-center text-sm font-bold leading-tight sm:text-base",
                  active
                    ? "bg-navy-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-w-[4.5rem] flex-1 items-center justify-center rounded-xl bg-gray-100 px-1 py-3 text-center text-sm font-bold leading-tight text-gray-700 hover:bg-gray-200 sm:text-base"
          >
            ログアウト
          </button>
        </div>
      </nav>
    </div>
  );
}
