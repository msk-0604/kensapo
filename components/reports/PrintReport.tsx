"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PrintReport({
  projectName,
  reportDate,
  content,
  backHref,
}: {
  projectName: string;
  reportDate: string;
  content: string;
  backHref: string;
}) {
  return (
    <>
      <div className="no-print mb-6 space-y-4">
        <Button onClick={() => window.print()} fullWidth>
          この報告書を印刷する
        </Button>
        <Link href={backHref}>
          <Button variant="secondary" fullWidth>
            報告書の画面に戻る
          </Button>
        </Link>
      </div>

      <article className="mx-auto max-w-2xl rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <header className="mb-8 border-b-2 border-gray-200 pb-6">
          <p className="text-lg text-gray-600">工事進捗報告書</p>
          <h1 className="mt-2 text-2xl font-bold text-navy-950">{projectName}</h1>
          <p className="mt-2 text-lg text-gray-700">作業日：{reportDate}</p>
        </header>
        <pre className="whitespace-pre-wrap font-sans text-lg leading-loose text-gray-900">
          {content}
        </pre>
        <footer className="mt-12 border-t-2 border-gray-100 pt-4 text-center text-base text-gray-400">
          ケンサポ
        </footer>
      </article>
    </>
  );
}
