"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, X } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { removeFromCartAction, setQuantityAction } from "@/lib/actions/cart";
import { CART_MAX_QTY } from "@/lib/siteConfig";

export interface MiniCartItem {
  id: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
}

// Checking cart contents used to mean a full navigation to /cart just to
// see what's in it — the icon only ever showed a count badge. This is
// the same line-item shape as the full cart page, just compact enough to
// live in a drawer.
export function MiniCart({ items }: { items: MiniCartItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function updateQty(itemId: string, next: number) {
    startTransition(async () => {
      await setQuantityAction(itemId, next);
      router.refresh();
    });
  }

  function remove(itemId: string) {
    startTransition(async () => {
      await removeFromCartAction(itemId);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
        onClick={() => setOpen(true)}
        className="relative grid size-11 place-items-center rounded-full hover:bg-surface-sunk"
      >
        <ShoppingCart className="size-5" aria-hidden />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-action text-[10px] font-semibold text-white">
            {count}
          </span>
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Your cart" side="right">
        {items.length === 0 ? (
          <p className="text-[13px] text-ink-muted">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-[6px] bg-surface-sunk">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 text-[13px]">
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="text-ink-muted">₹{item.price.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={pending}
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="grid size-8 place-items-center rounded-full border border-[var(--color-border)] hover:bg-surface-sunk disabled:opacity-50"
                  >
                    <Minus className="size-3" aria-hidden />
                  </button>
                  <span className="w-5 text-center text-[13px] tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={pending || item.quantity >= CART_MAX_QTY}
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="grid size-8 place-items-center rounded-full border border-[var(--color-border)] hover:bg-surface-sunk disabled:opacity-50"
                  >
                    <Plus className="size-3" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Remove"
                  disabled={pending}
                  onClick={() => remove(item.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-surface-sunk"
                >
                  <X className="size-3.5 text-ink-muted" aria-hidden />
                </button>
              </div>
            ))}

            <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <span className="text-[13px] text-ink-muted">Subtotal</span>
              <span className="font-display text-[16px] font-bold tabular-nums text-ink">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-4 font-body text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center justify-center text-[13px] font-semibold text-action hover:underline"
            >
              View full cart
            </Link>
          </div>
        )}
        {items.length === 0 && (
          <Link
            href="/bikes"
            onClick={() => setOpen(false)}
            className="mt-4 flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border-[1.5px] border-ink px-4 font-body text-[13px] font-semibold text-ink hover:bg-surface-sunk"
          >
            Browse eBikes
          </Link>
        )}
      </Drawer>
    </>
  );
}
