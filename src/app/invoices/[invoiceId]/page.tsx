import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CANONICAL_CONTACT } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

// GST invoice (11b) — "file-text (invoice)" was in the icon set and 5a
// could "resend invoice" long before the document itself existed. Kept
// as a plain printable page rather than a generated PDF file for now —
// print-to-PDF covers it until a PDF pipeline is worth building.
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const user = await getCurrentUser();
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: { include: { items: { include: { model: true } }, user: true, address: true } },
    },
  });

  if (!invoice || (user && invoice.order.userId !== user.id && user.role === "RIDER")) {
    notFound();
  }

  const { order } = invoice;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-[14px] text-ink">
      <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="font-display text-[22px] font-bold">RAPTRIC</h1>
          <p className="text-[12px] text-ink-muted">{CANONICAL_CONTACT.addressLine}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Tax Invoice</p>
          <p className="text-[12px] text-ink-muted">{invoice.invoiceNo}</p>
          <p className="text-[12px] text-ink-muted">
            {invoice.createdAt.toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-between text-[12px]">
        <div>
          <p className="font-semibold text-ink-muted">BILLED TO</p>
          <p>{order.user.name ?? order.user.phone}</p>
          {order.address && (
            <p className="text-ink-muted">
              {order.address.line1}, {order.address.city} {order.address.pincode}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-semibold text-ink-muted">ORDER</p>
          <p>{order.orderNo}</p>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-[var(--color-border)]">
              <td className="py-2">{item.model.name}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right tabular-nums">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-48 text-[13px]">
          <div className="flex justify-between py-1">
            <span className="text-ink-muted">Subtotal</span>
            <span className="tabular-nums">₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-ink-muted">Delivery</span>
            <span className="tabular-nums">₹{order.deliveryFee.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--color-border)] py-1 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[11px] text-ink-muted">
        Your frame number is on this invoice and on your warranty card.
      </p>
    </div>
  );
}
