import { db } from "@/lib/db";
import { OpsOrderRow } from "@/components/ops/OpsOrderRow";

export const dynamic = "force-dynamic";

// 5b — order management using the same status model customers see
// (src/lib/orderStatus.ts), so ops and the rider's tracking view never
// drift into two different vocabularies for the same order.
export default async function OpsOrdersPage() {
  const orders = await db.order.findMany({
    where: { status: { notIn: ["PENDING_PAYMENT"] } },
    include: { user: true, items: { include: { model: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Orders</h1>
      <table className="mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Order</th>
            <th className="py-2">Rider</th>
            <th className="py-2">Items</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <OpsOrderRow
              key={o.id}
              orderId={o.id}
              orderNo={o.orderNo}
              rider={o.user.name ?? o.user.phone}
              items={o.items.map((i) => `${i.quantity}× ${i.model.name}`).join(", ")}
              status={o.status}
              createdAt={o.createdAt.toISOString()}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
