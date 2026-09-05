"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { setProductStatusAction } from "@/lib/actions/cms";

const TONE: Record<string, string> = {
  LIVE: "bg-success-bg text-success",
  DRAFT: "bg-caution-bg text-caution",
  ARCHIVED: "bg-surface-sunk text-ink-muted",
};

export function ProductStatusToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setProductStatusAction(id, status === "LIVE" ? "DRAFT" : "LIVE");
          router.refresh();
        })
      }
      className={cn(
        "rounded-[999px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
        TONE[status],
      )}
    >
      {status}
    </button>
  );
}
