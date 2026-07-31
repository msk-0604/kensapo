"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { HelpMedia } from "@/lib/help/types";
import { resolveMediaKind } from "@/lib/help/media";

type Props = {
  media: HelpMedia | null;
  onClose: () => void;
};

export function HelpLightbox({ media, onClose }: Props) {
  useEffect(() => {
    if (!media) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [media, onClose]);

  if (!media) return null;

  const kind = resolveMediaKind(media.src, media.kind);
  const label = media.alt ?? media.caption ?? "拡大表示";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 no-print"
      role="dialog"
      aria-modal
      aria-label={label}
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-black">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy-950"
          aria-label="閉じる"
        >
          <X className="h-6 w-6" />
        </button>
        {kind === "video" ? (
          <video
            src={media.src}
            controls
            autoPlay
            playsInline
            className="max-h-[90vh] w-full"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.src}
            alt={label}
            className="max-h-[90vh] w-full object-contain"
          />
        )}
        {media.caption ? (
          <p className="bg-black px-4 py-3 text-center text-base text-white">
            {media.caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
