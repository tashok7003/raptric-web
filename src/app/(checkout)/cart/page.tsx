import Link from "next/link";
import { getCart } from "@/lib/cart";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { RESERVE_HOLD_HOURS, RETURN_WINDOW_DAYS } from "@/lib/siteConfig";
import { isEmiEligible, calcEmiMonthly } from "@/lib/emi";

export const dynamic = "force-dynamic";

// Cart (2e) — a real exit to a test ride, not just an abandon path, and
// the 48-hour reserve on each line (9c/3f) shown honestly.
export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.model.price * i.quantity, 0);
  const emiEligible = isEmiEligible(subtotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-body text-[20px] font-bold text-ink">
          Your cart is empty
        </h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          Not ready to decide? A 15-minute test ride tells you more than
          any spec sheet.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/bikes"
            className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-5 py-2.5 font-body text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
          >
            Browse eBikes
          </Link>
          <Link
            href="/test-ride"
            className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border-[1.5px] border-ink px-5 py-2.5 font-body text-[13px] font-semibold text-ink hover:bg-surface-sunk"
          >
            Book a test ride
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-body text-[22px] font-semibold text-ink">
        Your cart · {items.length} item{items.length === 1 ? "" : "s"}
      </h1>

      <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-info-bg px-4 py-2.5 text-[13px] text-action">
        Held for {RESERVE_HOLD_HOURS} hours · {RETURN_WINDOW_DAYS}-day returns
        if it's not right
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <CartLineItem
            key={item.id}
            itemId={item.id}
            name={item.model.name}
            price={item.model.price}
            quantity={item.quantity}
            reservedUntil={item.reservedUntil}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <div className="flex flex-col">
          <span className="font-display text-[20px] font-bold tabular-nums text-ink">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
          {emiEligible && (
            <span className="text-[12px] text-ink-muted">
              or from ₹{calcEmiMonthly(subtotal, 24).toLocaleString("en-IN")}/mo
            </span>
          )}
        </div>
        <Link
          href="/checkout"
          className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-6 py-3 font-body text-[14px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          Checkout →
        </Link>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-4 text-center text-[13px] text-ink-muted">
        Still deciding?{" "}
        <Link href="/test-ride" className="text-action hover:underline">
          Book a test ride
        </Link>{" "}
        instead — no commitment.
      </div>
    </div>
  );
}
