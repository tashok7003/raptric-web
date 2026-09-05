"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Minus, Plus, X } from "lucide-react";
import { removeFromCartAction, setQuantityAction } from "@/lib/actions/cart";
import { CART_MAX_QTY } from "@/lib/siteConfig";

interface CartLineItemProps {
  itemId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  reservedUntil: Date | null;
}

export function CartLineItem({
  itemId,
  name,
  image,
  price,
  quantity,
  reservedUntil,
}: CartLineItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function updateQty(next: number) {
    startTransition(async () => {
      await setQuantityAction(itemId, next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-[6px] bg-surface-sunk">
        {image ? (
          <Image src={image} alt={name} fill sizes="64px" className="object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-body text-[14px] font-semibold text-ink">
          {name}
        </span>
        <span className="text-[13px] text-ink-muted">
          ₹{price.toLocaleString("en-IN")}
        </span>
        {reservedUntil && (
          <span className="text-[11px] text-caution">
            Held until{" "}
            {reservedUntil.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={pending}
          onClick={() => updateQty(quantity - 1)}
          className="grid size-11 place-items-center rounded-full border border-[var(--color-border)] hover:bg-surface-sunk disabled:opacity-50"
        >
          <Minus className="size-3.5" aria-hidden />
        </button>
        <span className="w-6 text-center text-[14px] font-medium tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={pending || quantity >= CART_MAX_QTY}
          onClick={() => updateQty(quantity + 1)}
          className="grid size-11 place-items-center rounded-full border border-[var(--color-border)] hover:bg-surface-sunk disabled:opacity-50"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>
      <button
        type="button"
        aria-label="Remove"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await removeFromCartAction(itemId);
            router.refresh();
          })
        }
        className="grid size-11 place-items-center rounded-full hover:bg-surface-sunk"
      >
        <X className="size-4 text-ink-muted" aria-hidden />
      </button>
    </div>
  );
}
