import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/account/EmptyState";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = await db.order.findMany({
    where: { userId: user!.id },
    include: { items: { include: { model: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        detail="Once you buy, it'll show up here with live tracking."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[14px] font-semibold text-ink">
              {order.orderNo}
            </span>
            <span className="text-[12px] text-ink-muted">
              {order.items.map((i) => i.model.name).join(", ")} · ₹
              {order.total.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
              {order.status.replaceAll("_", " ")}
            </span>
            {order.status !== "PENDING_PAYMENT" && (
              <Link
                href={`/order-confirmation/${order.id}`}
                className="text-[13px] font-semibold text-action hover:underline"
              >
                Track →
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
