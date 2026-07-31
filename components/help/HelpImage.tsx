"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HelpMedia } from "@/lib/help/types";
import { resolveMediaKind, toHelpMedia } from "@/lib/help/media";

type Props = {
  src?: string;
  media?: HelpMedia | string | null;
  alt: string;
  className?: string;
  caption?: string;
  onOpen?: (media: HelpMedia) => void;
};

function Placeholder({ alt }: { alt: string }) {
  return (
    <div
      className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-gray-600"
      role="img"
      aria-label={`${alt}（画像準備中）`}
    >
      <ImageIcon className="h-10 w-10 text-gray-400" aria-hidden />
      <p className="text-lg font-bold text-gray-700">画像準備中</p>
      <p className="text-base text-gray-500">{alt}</p>
    </div>
  );
}

export function HelpImage({ src, media, alt, className, caption, onOpen }: Props) {
  const resolved = toHelpMedia(media ?? src);
  const [failed, setFailed] = useState(!resolved);

  useEffect(() => {
    setFailed(!resolved);
  }, [resolved?.src]);

  const kind = resolved ? resolveMediaKind(resolved.src, resolved.kind) : "image";
  const label = resolved?.alt ?? alt;
  const cap = caption ?? resolved?.caption;

  let body: React.ReactNode;
  if (failed || !resolved) {
    body = <Placeholder alt={label} />;
  } else if (kind === "video") {
    body = (
      <video
        src={resolved.src}
        controls
        playsInline
        className="w-full rounded-2xl border-2 border-gray-200 bg-black shadow-sm"
        onError={() => setFailed(true)}
      >
        お使いのブラウザは動画再生に対応していません。
      </video>
    );
  } else {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved.src}
        alt={label}
        className="w-full rounded-2xl border-2 border-gray-200 bg-white object-cover shadow-sm"
        onError={() => setFailed(true)}
      />
    );
    body = onOpen ? (
      <button
        type="button"
        className="block w-full cursor-zoom-in"
        onClick={() => onOpen(resolved)}
        aria-label={`${label}を大きく表示`}
      >
        {img}
      </button>
    ) : (
      img
    );
  }

  return (
    <figure className={cn("my-4", className)}>
      {body}
      {cap ? (
        <figcaption className="mt-2 text-center text-base text-gray-600">
          {cap}
        </figcaption>
      ) : null}
    </figure>
  );
}
