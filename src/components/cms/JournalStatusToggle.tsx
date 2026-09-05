"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { setJournalStatusAction } from "@/lib/actions/journal";

const TONE: Record<string, string> = {
  LIVE: "bg-success-bg text-success",
  DRAFT: "bg-caution-bg text-caution",
};

export function JournalStatusToggle({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setJournalStatusAction(id, status === "LIVE" ? "DRAFT" : "LIVE");
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
