"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center">
      <h2 className="text-xl font-bold text-red-900">画面を表示できませんでした</h2>
      <p className="mt-3 text-base text-red-800">
        通信が不安定な場合があります。もう一度お試しください。
      </p>
      <div className="mt-6 space-y-3">
        <Button type="button" fullWidth onClick={() => reset()}>
          もう一度読み込む
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={() => window.location.assign("/login")}
        >
          ログイン画面へ
        </Button>
      </div>
    </section>
  );
}
