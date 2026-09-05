import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { StepTracker } from "@/components/ui/StepTracker";
import { OrderActions } from "@/components/order/OrderActions";
import { WARRANTY } from "@/lib/siteConfig";
import { orderTrackerSteps, NEXT_ORDER_STATUS } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

// Order confirmation + tracking (1i/3c) — one status model read both
// here and (eventually) by ops's order list, so the two can't drift.
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { model: true } }, invoice: true, payment: true },
  });

  if (!order || order.status === "PENDING_PAYMENT") notFound();

  const cancelled = order.status === "CANCELLED" || order.status === "RETURNED";
  const warrantyActivated = await db.ownedBike.count({
    where: { userId: order.userId, modelId: { in: order.items.map((i) => i.modelId) } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center">
      <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-success">
        {cancelled ? order.status.charAt(0) + order.status.slice(1).toLowerCase() : "Order confirmed"}
      </span>
      <h1 className="mt-2 font-display text-[26px] font-bold text-ink">
        Order {order.orderNo}
      </h1>
      {!cancelled && (
        <p className="mt-2 text-[14px] text-ink-muted">
          We'll text you the delivery day within 24 hours.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 text-left">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-[14px]">
            <span>
              {item.quantity} × {item.model.name}
            </span>
            <span className="tabular-nums">
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-semibold">
          <span>Total paid</span>
          <span className="tabular-nums">₹{order.total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {!cancelled && (
        <div className="mt-6 text-left">
          <StepTracker orientation="vertical" steps={orderTrackerSteps(order.status)} />
        </div>
      )}

      <p className="mt-4 text-[12px] text-ink-muted">
        {WARRANTY.headline} starts the day it's delivered — activate it in 2
        minutes when it arrives.
      </p>

      {!cancelled && (
        <OrderActions
          orderId={order.id}
          status={order.status}
          hasNextStatus={!!NEXT_ORDER_STATUS[order.status]}
          warrantyActivated={warrantyActivated > 0}
        />
      )}

      <div className="mt-6 flex justify-center gap-3">
        {order.invoice && (
          <Link
            href={`/invoices/${order.invoice.id}`}
            target="_blank"
            className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border-[1.5px] border-ink px-4 py-2.5 font-body text-[13px] font-semibold text-ink hover:bg-surface-sunk"
          >
            Invoice {order.invoice.invoiceNo}
          </Link>
        )}
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-4 py-2.5 font-body text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
