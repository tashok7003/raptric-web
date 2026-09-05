import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/account/EmptyState";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  const invoices = await db.invoice.findMany({
    where: { order: { userId: user!.id } },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        detail="Invoices and your warranty card appear here after your first order."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[14px] font-semibold text-ink">
              Invoice {inv.invoiceNo}
            </span>
            <span className="text-[12px] text-ink-muted">
              Order {inv.order.orderNo} · ₹{inv.order.total.toLocaleString("en-IN")}
            </span>
          </div>
          <Link
            href={`/invoices/${inv.id}`}
            target="_blank"
            className="text-[13px] font-semibold text-action hover:underline"
          >
            Download
          </Link>
        </div>
      ))}
    </div>
  );
}
