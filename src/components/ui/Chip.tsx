"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ChipProps {
  children: React.ReactNode;
  variant?: "default" | "selected" | "unavailable" | "badge";
  onRemove?: () => void;
  className?: string;
}

// 10d — a selected chip must carry its own remove affordance. Badge is not
// interactive and never mixed into a filter row (enforced by callers).
export function Chip({
  children,
  variant = "default",
  onRemove,
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] border px-3 py-1 text-[13px] font-body",
        variant === "default" && "border-[var(--color-border)] text-ink-muted",
        variant === "selected" &&
          "border-action bg-[color-mix(in_srgb,var(--color-action)_8%,white)] text-action",
        variant === "unavailable" &&
          "border-[var(--color-border)] text-ink-muted opacity-40",
        variant === "badge" &&
          "border-action bg-[color-mix(in_srgb,var(--color-action)_12%,white)] text-action font-semibold",
        className,
      )}
    >
      {children}
      {variant === "selected" && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove filter"
          className="rounded-full p-0.5 hover:bg-black/5"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  );
}
