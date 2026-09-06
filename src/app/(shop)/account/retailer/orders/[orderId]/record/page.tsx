import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { CANONICAL_CONTACT } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

// A plain printable page rather than a generated PDF or a priced GST tax
// invoice — same call as the consumer invoice at src/app/invoices/[invoiceId]
// (print-to-PDF covers it), but honest about a real gap: WholesaleOrder
// has no dealer unit-price field, so this can't respectfully claim to be
// a tax invoice with real amounts. It's a delivery record for the
// retailer's own paperwork until real dealer pricing is modeled.
export default async function RetailerOrderRecordPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "RETAILER" || !user.retailerId) redirect("/account");

  const order = await db.wholesaleOrder.findUnique({
    where: { id: orderId },
    include: { model: true, retailer: true },
  });

  if (!order || order.retailerId !== user.retailerId || order.status !== "DELIVERED") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-[14px] text-ink">
      <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="font-display text-[22px] font-bold">RAPTRIC</h1>
          <p className="text-[12px] text-ink-muted">{CANONICAL_CONTACT.addressLine}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Wholesale delivery record</p>
          <p className="text-[12px] text-ink-muted">Order {order.id.slice(-8).toUpperCase()}</p>
          <p className="text-[12px] text-ink-muted">
            {order.createdAt.toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-6 text-[12px]">
        <p className="font-semibold text-ink-muted">DELIVERED TO</p>
        <p>{order.retailer.name}</p>
        <p className="text-ink-muted">{order.retailer.ownerName} · {order.retailer.territoryPin}</p>
      </div>

      <table className="mt-6 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Model</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Terms</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[var(--color-border)]">
            <td className="py-2">{order.model.name}</td>
            <td className="py-2 text-right tabular-nums">{order.quantity}</td>
            <td className="py-2 text-right">{order.consignment ? "Consignment" : "Outright"}</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-6 text-[12px] text-ink-muted">
        Pricing for this order follows your dealer agreement and isn&apos;t itemised here —
        contact your RAPTRIC account manager for a priced GST invoice.
      </p>

      <p className="mt-10 text-center text-[11px] text-ink-muted">
        Keep this record for your own stock and delivery tracking.
      </p>
    </div>
  );
}
