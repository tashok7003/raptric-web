"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useCompareIds } from "@/lib/compareTray";

// Competitive audit (turn 15) — EMotorad and Ninety One both show a
// persistent "Compare (N)" state on the listing grid itself; RAPTRIC's
// per-card toggle (ProductCard's Scale icon button) had no visible count
// until the floating CompareTray appeared. This sits in the page header,
// always mounted, so the count is visible the moment something's picked.
export function CompareCounter() {
  const ids = useCompareIds();

  if (ids.length === 0) return null;

  return (
    <Link
      href={`/compare?ids=${ids.join(",")}`}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-action bg-[color-mix(in_srgb,var(--color-action)_8%,white)] px-3 text-[13px] font-semibold text-action hover:bg-[color-mix(in_srgb,var(--color-action)_16%,white)]"
    >
      <Scale className="size-3.5" aria-hidden />
      Compare ({ids.length})
    </Link>
  );
}
