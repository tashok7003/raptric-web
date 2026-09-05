"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCartAction } from "@/lib/actions/cart";
import { Button } from "@/components/ui/Button";

interface AddToCartBarProps {
  modelId: string;
  name: string;
  priceLabel: string;
  subLabel: string;
  outOfStock?: boolean;
}

// 2d/1f — sticky buy bar, bottom third on mobile; same "Add to cart"
// action the hero button calls, so the PDP has exactly one purchase path
// wired to two entry points.
export function AddToCartBar({
  modelId,
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
            {added ? "Added ✓" : `Add ${name} to cart`}
          </Button>
        )}
      </div>
    </div>
  );
}
