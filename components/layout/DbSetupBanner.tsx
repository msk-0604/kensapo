"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function DbSetupBanner({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <section className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5">
      <p className="text-lg font-bold text-amber-900">
        データベースの設定がまだです
      </p>
      <p className="mt-2 text-base text-amber-800">
        SQLを1回実行すれば使えます（3分）。
      </p>
      <Link href="/setup" className="mt-4 block">
        <Button fullWidth size="md">
          設定手順を見る
        </Button>
      </Link>
    </section>
  );
}
