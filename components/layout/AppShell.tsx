"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, Home, MapPin, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { registerPushServiceWorker } from "@/lib/push/client";
import { HelpChrome } from "@/components/help/HelpChrome";

const navItems = [
  { href: "/dashboard", label: "ホーム", Icon: Home },
  { href: "/schedule", label: "予定", Icon: Calendar },
  { href: "/sites", label: "現場", Icon: MapPin },
  { href: "/settings", label: "設定", Icon: Settings },
] as const;

export function AppShell({
  children,
  userId,
  userName: initialUserName,
  companyName: initialCompanyName,
}: {
  children: React.ReactNode;
  userId: string;
  userName?: string;
  companyName?: string;
}) {
  const pathname = usePathname();
  const [userName, setUserName] = useState(initialUserName ?? "");
  const [companyName, setCompanyName] = useState(initialCompanyName ?? "");
  const isPrintView = pathname.includes("/pdf");
  const isHelp = pathname.startsWith("/help");

  useEffect(() => {
    void registerPushServiceWorker();
  }, []);

  useEffect(() => {
    if (initialUserName) return;

    let cancelled = false;
    void (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("name, companies(name)")
          .eq("id", userId)
          .single();
        if (cancelled || !data) return;
        const row = data as {
          name: string;
          companies: { name: string } | { name: string }[] | null;
        };
        const company = Array.isArray(row.companies)
          ? row.companies[0]
          : row.companies;
        setUserName(row.name);
        setCompanyName(company?.name ?? "");
      } catch {
        // 表示名の取得に失敗しても画面は使える
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, initialUserName]);

  if (isPrintView) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-6">{children}</main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b-2 border-gray-200 bg-white no-print">
        <div
          className={cn(
            "mx-auto flex min-h-[4.5rem] items-center justify-between px-5",
            isHelp ? "max-w-4xl" : "max-w-lg"
          )}
        >
          <Link href="/dashboard" className="text-2xl font-bold text-navy-950">
            KenSapo
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/help"
              className={cn(
                "flex min-h-12 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-base font-bold transition-colors",
                isHelp
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-gray-300 bg-white text-navy-900 hover:bg-gray-50"
              )}
              aria-label="取扱説明書"
            >
              <BookOpen className="h-5 w-5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">取扱説明書</span>
            </Link>
            <div className="text-right text-base leading-snug text-gray-700">
              <p className="text-lg font-bold text-gray-900">
                {userName || "\u00A0"}
              </p>
              {companyName ? (
                <p className="text-base text-gray-600">{companyName}</p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full flex-1 overflow-x-hidden px-5 py-8 pb-[calc(7.5rem+env(safe-area-inset-bottom))]",
          isHelp ? "max-w-4xl" : "max-w-lg"
        )}
      >
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-gray-200 bg-white shadow-[0_-4px_16px_rgba(15,23,41,0.06)] pb-[env(safe-area-inset-bottom)] no-print"
        aria-label="メインメニュー"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 px-3 pb-3 pt-3">
          {navItems.map(({ href, label, Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-[5rem] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center transition-colors",
                  active
                    ? "bg-navy-900 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                )}
              >
                <Icon className="h-8 w-8 shrink-0" aria-hidden />
                <span className="text-base font-bold leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <HelpChrome />
    </div>
  );
}
