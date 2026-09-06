"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { uploadImageAction } from "@/lib/actions/upload";

interface ImageUploadFieldProps {
  onUploaded: (url: string) => void;
  label?: string;
}

// Sits next to every "paste an image URL" field this CMS has — those
// required a URL that already existed somewhere and, for anything
// rendered via next/image, a host on next.config.ts's allowlist. This
// uploads a real file instead and hands back a same-origin URL.
export function ImageUploadField({ onUploaded, label = "Upload a file instead" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { url } = await uploadImageAction(formData);
        onUploaded(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-[13px] font-semibold text-ink hover:bg-surface-sunk">
        <Upload className="size-3.5" aria-hidden />
        {pending ? "Uploading…" : label}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          disabled={pending}
          className="hidden"
        />
      </label>
      {error && <span className="text-[13px] text-danger">{error}</span>}
    </div>
  );
}
