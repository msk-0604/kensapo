"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  alt: string;
  className?: string;
  caption?: string;
};

export function HelpImage({ src, alt, className, caption }: Props) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  return (
    <figure className={cn("my-4", className)}>
      {failed || !src ? (
        <div
          className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-gray-600"
          role="img"
          aria-label={`${alt}（画像準備中）`}
        >
          <ImageIcon className="h-10 w-10 text-gray-400" aria-hidden />
          <p className="text-lg font-bold text-gray-700">画像準備中</p>
          <p className="text-base text-gray-500">{alt}</p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full rounded-2xl border-2 border-gray-200 bg-white object-cover shadow-sm"
          onError={() => setFailed(true)}
        />
      )}
      {caption ? (
        <figcaption className="mt-2 text-center text-base text-gray-600">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
