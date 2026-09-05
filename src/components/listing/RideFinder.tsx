"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

type Budget = "under25" | "25to30" | "30plus";
type Type = "ebike" | "mbike";

// Competitive audit (turn 15) — Hero Cycles' "Find My Ride" guided
// navigator, adapted to RAPTRIC's much smaller catalog: this doesn't
// invent new recommendation logic, it's a friendly front door onto the
// same type/budget query params FilterChip already builds. The 2-question
// picker was explicitly cut for v1 (see the comment above BikesListingPage)
// on the reasoning that "11 SKUs don't justify it yet" — worth watching
// whether this earns its keep as the catalog grows, not a permanent call.
export function RideFinder() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [type, setType] = useState<Type | null>(null);

  function showMatches() {
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (budget) qs.set("budget", budget);
    router.push(`/bikes${qs.toString() ? `?${qs}` : ""}`);
  }

  return (
    <div className="mt-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2.5 text-left"
      >
        <span className="font-body text-[14px] font-semibold text-ink">
          Not sure which one? Answer 2 quick questions
        </span>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-ink-muted" aria-hidden />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-[var(--color-border)] px-4 py-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              Your budget
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["under25", "Under ₹25k"],
                  ["25to30", "₹25k–30k"],
                  ["30plus", "₹30k+"],
                ] as [Budget, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={budget === value}
                  onClick={() => setBudget(value)}
                  className="inline-flex min-h-11 items-center"
                >
                  <Chip variant={budget === value ? "selected" : "default"}>{label}</Chip>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
              Pedal-assist, or fully manual?
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={type === "ebike"}
                onClick={() => setType("ebike")}
                className="inline-flex min-h-11 items-center"
              >
                <Chip variant={type === "ebike" ? "selected" : "default"}>
                  eBike — pedal-assist
                </Chip>
              </button>
              <button
                type="button"
                aria-pressed={type === "mbike"}
                onClick={() => setType("mbike")}
                className="inline-flex min-h-11 items-center"
              >
                <Chip variant={type === "mbike" ? "selected" : "default"}>
                  mBike — manual, multi-gear
                </Chip>
              </button>
            </div>
          </div>

          <Button variant="primary" onClick={showMatches} disabled={!budget && !type}>
            Show my matches
          </Button>
        </div>
      )}
    </div>
  );
}
