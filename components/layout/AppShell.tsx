"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, MapPin, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "ホーム", Icon: Home },
  { href: "/schedule", label: "予定", Icon: Calendar },
  { href: "/sites", label: "現場", Icon: MapPin },
  { href: "/settings", label: "設定", Icon: Settings },
] as const;

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
  const isPrintView = pathname.includes("/pdf");

  if (isPrintView) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-6">{children}</main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b-2 border-gray-200 bg-white">
        <div className="mx-auto flex min-h-[4.5rem] max-w-lg items-center justify-between px-5">
          <Link href="/dashboard" className="text-2xl font-bold text-navy-950">
            KenSapo
          </Link>
          <div className="text-right text-base leading-snug text-gray-700">
            <p className="text-lg font-bold text-gray-900">{userName}</p>
            {companyName ? (
              <p className="text-base text-gray-600">{companyName}</p>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-8 pb-28">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
        aria-label="メインメニュー"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2 px-3 py-3">
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
    </div>
  );
}
