import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Step {
  label: string;
  state: "done" | "current" | "upcoming";
}

interface StepTrackerProps {
  steps: Step[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

// 10e — same component in checkout, order tracking, claims, the retailer
// pipeline and wholesale reconciliation. Horizontal for a live process,
// vertical timeline for a history.
export function StepTracker({
  steps,
  orientation = "horizontal",
  className,
}: StepTrackerProps) {
  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 font-mono-token text-[13px]",
              step.state === "upcoming" ? "text-ink-muted/50" : "text-ink-muted",
            )}
          >
            <StepBullet state={step.state} index={i} />
            {step.label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex items-center gap-1.5 font-mono-token text-[13px]",
              step.state === "upcoming" ? "text-ink-muted/50" : "text-ink-muted",
            )}
          >
            <StepBullet state={step.state} index={i} />
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <span className="text-ink-muted/40" aria-hidden>
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function StepBullet({ state, index }: { state: Step["state"]; index: number }) {
  return (
    <span
      className={cn(
        "grid size-3.5 shrink-0 place-items-center rounded-full border text-[8px]",
        state === "done" && "border-action bg-action text-white",
        state === "current" && "border-action text-action font-semibold",
        state === "upcoming" && "border-[var(--color-border)]",
      )}
    >
      {state === "done" ? <Check className="size-2.5" /> : index + 1}
    </span>
  );
}
