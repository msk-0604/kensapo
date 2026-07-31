"use client";

import { useState } from "react";
import Link from "next/link";
import type { HelpArticle, HelpMedia } from "@/lib/help/types";
import { HelpImage } from "@/components/help/HelpImage";
import { HelpPrintActions } from "@/components/help/HelpPrintActions";
import { HelpFavoriteButton } from "@/components/help/HelpFavoriteButton";
import { HelpLightbox } from "@/components/help/HelpLightbox";
import { Card } from "@/components/ui/Card";
import { getStepMedia } from "@/lib/help/media";

export function HelpArticleView({
  article,
  related,
}: {
  article: HelpArticle;
  related: HelpArticle[];
}) {
  const [lightbox, setLightbox] = useState<HelpMedia | null>(null);

  return (
    <article className="help-print-area space-y-8">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-bold text-navy-700">{article.category}</p>
          <h1 className="mt-1 text-[1.875rem] font-bold leading-tight text-navy-950">
            {article.title}
          </h1>
          <p className="mt-2 text-lg text-gray-600">{article.summary}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto">
          <HelpFavoriteButton articleId={article.id} title={article.title} />
          <HelpPrintActions title={article.title} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
        <nav
          className="no-print rounded-2xl border-2 border-gray-200 bg-white p-4 lg:sticky lg:top-24 lg:self-start"
          aria-label="目次"
        >
          <p className="mb-3 text-base font-bold text-gray-700">目次</p>
          <ol className="space-y-2 text-base">
            <li>
              <a href="#overview" className="font-medium text-navy-900 underline">
                説明
              </a>
            </li>
            {article.steps.map((step, i) => (
              <li key={step.title}>
                <a
                  href={`#step-${i + 1}`}
                  className="font-medium text-navy-900 underline"
                >
                  {i + 1}. {step.title}
                </a>
              </li>
            ))}
            {article.example ? (
              <li>
                <a href="#example" className="font-medium text-navy-900 underline">
                  例
                </a>
              </li>
            ) : null}
            {article.notes?.length ? (
              <li>
                <a href="#notes" className="font-medium text-navy-900 underline">
                  注意事項
                </a>
              </li>
            ) : null}
          </ol>
        </nav>

        <div className="space-y-8">
          <Card id="overview">
            <h2 className="mb-3 text-2xl font-bold text-navy-950">説明</h2>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
              {article.content}
            </p>
          </Card>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-950">手順</h2>
            {article.steps.map((step, i) => (
              <Card key={step.title} id={`step-${i + 1}`}>
                <p className="mb-2 text-base font-bold text-navy-700">
                  {i + 1} / {article.steps.length}
                </p>
                <h3 className="text-xl font-bold text-navy-950">
                  {i < 20
                    ? `${String.fromCodePoint(0x2460 + i)} `
                    : `${i + 1}. `}
                  {step.title}
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-gray-800">
                  {step.body}
                </p>
                <HelpImage
                  media={getStepMedia(article, step, i)}
                  alt={`${article.title} 手順${i + 1}の画面`}
                  caption={`手順 ${i + 1}`}
                  onOpen={setLightbox}
                />
                {i < article.steps.length - 1 ? (
                  <p className="mt-2 text-center text-2xl font-bold text-navy-700">
                    ↓
                  </p>
                ) : null}
              </Card>
            ))}
          </section>

          {article.example ? (
            <Card id="example" className="!border-blue-200 !bg-blue-50">
              <h2 className="mb-3 text-2xl font-bold text-navy-950">例</h2>
              <p className="text-lg leading-relaxed text-gray-800">
                {article.example}
              </p>
            </Card>
          ) : null}

          {article.notes?.length ? (
            <Card id="notes" className="!border-amber-300 !bg-amber-50">
              <h2 className="mb-3 text-2xl font-bold text-navy-950">注意事項</h2>
              <ul className="list-disc space-y-2 pl-6 text-lg text-gray-800">
                {article.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Card>
          ) : null}

          {related.length > 0 ? (
            <section className="no-print">
              <h2 className="mb-3 text-xl font-bold text-navy-950">関連トピック</h2>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/help/${r.id}`}
                      className="text-lg font-bold text-navy-900 underline"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <HelpLightbox media={lightbox} onClose={() => setLightbox(null)} />
    </article>
  );
}
