import type { HelpArticle, HelpMedia, HelpMediaKind, HelpStep } from "@/lib/help/types";
import { detectMediaKind } from "@/lib/help/search";

export function resolveMediaKind(
  src: string,
  kind?: HelpMediaKind
): HelpMediaKind {
  return kind ?? detectMediaKind(src);
}

export function toHelpMedia(
  value: HelpMedia | string | undefined
): HelpMedia | null {
  if (!value) return null;
  if (typeof value === "string") {
    if (!value.trim()) return null;
    return { src: value, kind: detectMediaKind(value) };
  }
  if (!value.src?.trim()) return null;
  return {
    ...value,
    kind: resolveMediaKind(value.src, value.kind),
  };
}

/** 手順 i のメディア（step.media → media[i] → images[i]） */
export function getStepMedia(
  article: HelpArticle,
  step: HelpStep,
  index: number
): HelpMedia | null {
  const fromStep = toHelpMedia(step.media);
  if (fromStep) return fromStep;
  const fromMedia = article.media?.[index];
  if (fromMedia) return toHelpMedia(fromMedia);
  const fromImages = article.images?.[index];
  return toHelpMedia(fromImages);
}
