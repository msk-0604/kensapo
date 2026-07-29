"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TOUR_STORAGE_KEY } from "@/lib/help/route-map";

const STEPS = [
  {
    title: "ここがホームです",
    body: "今日の予定や、よく使う操作がまとまっています。",
    href: "/dashboard",
  },
  {
    title: "ここで現場を追加します",
    body: "「現場」メニューから工事現場を登録・確認できます。",
    href: "/sites",
  },
  {
    title: "予定で作業を始めます",
    body: "「予定」から開始・終了を記録できます。",
    href: "/schedule",
  },
  {
    title: "困ったら取扱説明書へ",
    body: "設定の「取扱説明書」、または画面右下の？からいつでも確認できます。",
    href: "/help",
  },
];

export function HelpTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(TOUR_STORAGE_KEY)) return;
      if (pathname === "/dashboard") setVisible(true);
    } catch {
      // storage不可でもアプリは動かす
    }
  }, [pathname]);

  function finish() {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  function next() {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    router.push(STEPS[nextStep].href);
  }

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[90] no-print" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto mt-[20vh] w-[min(100%-1.5rem,28rem)] rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-xl">
        <p className="text-base font-bold text-navy-700">
          システムガイド {step + 1} / {STEPS.length}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-navy-950">{current.title}</h2>
        <p className="mt-3 text-lg leading-relaxed text-gray-700">{current.body}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Button type="button" fullWidth onClick={next}>
            {step >= STEPS.length - 1 ? "完了" : "次へ"}
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={finish}>
            スキップ
          </Button>
        </div>
      </div>
    </div>
  );
}
