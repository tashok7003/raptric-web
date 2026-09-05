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
  const next = status === "LIVE" ? "DRAFT" : "LIVE";

  function handleClick() {
    const verb = next === "DRAFT" ? "Un-publish" : "Publish";
    if (!window.confirm(`${verb} this journal entry? It will ${next === "DRAFT" ? "come off" : "go live on"} the site immediately.`)) {
      return;
    }
    startTransition(async () => {
      await setJournalStatusAction(id, next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      aria-label={`${status} — click to ${next === "DRAFT" ? "un-publish" : "publish"}`}
      className="grid min-h-11 min-w-11 place-items-center rounded-[999px] border border-transparent px-1 hover:border-[var(--color-border)] hover:bg-surface-sunk disabled:opacity-50"
    >
      <span
        className={cn(
          "rounded-[999px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
          TONE[status],
        )}
      >
        {status}
      </span>
    </button>
  );
}
