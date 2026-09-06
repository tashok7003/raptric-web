"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface ProductGalleryProps {
  heroImage: string | null;
  gallery: string[];
  alt: string;
}

// The CMS gained a gallery-images editor (src/components/cms/ProductForm.tsx)
// before the PDP had anywhere to render it — every product still showed
// only the single hero image regardless of how many photos an editor added.
export function ProductGallery({ heroImage, gallery, alt }: ProductGalleryProps) {
  const images = Array.from(new Set([heroImage, ...gallery].filter((u): u is string => Boolean(u))));
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)] bg-surface-sunk">
        {current && (
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-[6px] border-2",
                i === active ? "border-ink" : "border-transparent",
              )}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
