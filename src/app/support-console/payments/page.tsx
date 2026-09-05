import { db } from "@/lib/db";

// 5a — failed payments with cart still held: the human behind 2g's
// "we can take this over the phone" promise.
export default async function FailedPaymentsQueuePage() {
  const payments = await db.payment.findMany({
    where: { status: "FAILED" },
    include: { order: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">
        Failed payments · {payments.length}
      </h1>
      <table className="mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Order</th>
            <th className="py-2">Rider</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Reason</th>
            <th className="py-2">Cart held</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const stillHeld = p.cartHeldUntil && p.cartHeldUntil > now;
            return (
              <tr key={p.id} className="border-b border-[var(--color-border)]">
                <td className="py-2 font-medium text-ink">{p.order.orderNo}</td>
                <td className="py-2 text-ink-muted">
                  {p.order.user.name ?? p.order.user.phone}
                </td>
                <td className="py-2 tabular-nums">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="py-2 text-ink-muted">{p.failureReason ?? "—"}</td>
                <td className={stillHeld ? "py-2 text-success" : "py-2 text-danger"}>
                  {stillHeld ? "Yes" : "Expired"}
                </td>
              </tr>
            );
          })}
          {payments.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-ink-muted">
                Nothing in the queue.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
