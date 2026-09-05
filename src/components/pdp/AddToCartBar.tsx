"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { addToCartAction } from "@/lib/actions/cart";
import { Button } from "@/components/ui/Button";

interface AddToCartBarProps {
  modelId: string;
  modelSlug: string;
  name: string;
  priceLabel: string;
  subLabel: string;
  outOfStock?: boolean;
}

// 2d/1f — sticky buy bar, bottom third on mobile; same "Add to cart"
// action the hero button calls, so the PDP has exactly one purchase path
// wired to two entry points. The test-ride link isn't a purchase path —
// it's the only way to reach it on mobile at all, since the hero's own
// test-ride link is md:flex-only.
export function AddToCartBar({
  modelId,
  modelSlug,
  name,
  priceLabel,
  subLabel,
  outOfStock,
}: AddToCartBarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    startTransition(async () => {
      await addToCartAction(modelId);
      setAdded(true);
      router.refresh();
      setTimeout(() => setAdded(false), 1500);
    });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-surface px-4 py-3 md:hidden">
      <div className="flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[16px] font-bold text-ink">
            {priceLabel}
          </span>
          <span className="text-[11px] text-ink-muted">{subLabel}</span>
        </div>
        <Link
          href={`/test-ride?model=${modelSlug}`}
          aria-label="Book a test ride"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--color-border)] hover:bg-surface-sunk"
        >
          <CalendarClock className="size-5 text-ink" aria-hidden />
        </Link>
        {outOfStock ? (
          <Button variant="secondary" className="ml-auto flex-1">
            Notify me
          </Button>
        ) : (
          <Button
            variant="primary"
            className="ml-auto flex-1"
            onClick={handleAdd}
            loading={pending}
            loadingLabel="Adding…"
            pulse={added}
          >
            {added ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4" aria-hidden /> Added
              </span>
            ) : (
              `Add ${name} to cart`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
