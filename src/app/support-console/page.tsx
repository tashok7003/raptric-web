import { db } from "@/lib/db";
import { CustomerSearchForm } from "@/components/support/CustomerSearchForm";
import { WARRANTY } from "@/lib/siteConfig";

// 5a — customer view: orders, cover and activity together, one search
// field. The recovery queues (failed payments, claims) are separate
// tabs since they're work queues, not a lookup.
export default async function SupportConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  const user = phone
    ? await db.user.findUnique({
        where: { phone },
        include: {
          orders: { include: { items: { include: { model: true } } }, orderBy: { createdAt: "desc" } },
          bikes: { include: { model: true, claims: true } },
          testRides: { include: { model: true, store: true } },
        },
      })
    : null;

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Customer search</h1>
      <CustomerSearchForm />

      {phone && !user && (
        <p className="mt-6 text-[14px] text-ink-muted">No rider found for {phone}.</p>
      )}

      {user && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <span className="text-[13px] font-semibold text-ink-muted">RIDER</span>
            <p className="text-[15px] font-medium text-ink">
              {user.name ?? "—"} · {user.phone}
            </p>
          </div>

          <div>
            <span className="text-[13px] font-semibold text-ink-muted">ORDERS</span>
            {user.orders.length === 0 ? (
              <p className="text-[13px] text-ink-muted">None</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1">
                {user.orders.map((o) => (
                  <li key={o.id} className="text-[13px] text-ink">
                    {o.orderNo} · {o.status} · ₹{o.total.toLocaleString("en-IN")} ·{" "}
                    {o.items.map((i) => i.model.name).join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <span className="text-[13px] font-semibold text-ink-muted">COVER</span>
            {user.bikes.length === 0 ? (
              <p className="text-[13px] text-ink-muted">No bike registered</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1">
                {user.bikes.map((b) => (
                  <li key={b.id} className="text-[13px] text-ink">
                    {b.model.name} · {b.frameNumber} · frame covered to{" "}
                    {b.frameWarrantyUntil.toLocaleDateString("en-IN")} · {b.claims.length}{" "}
                    claim(s)
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-[11px] text-ink-muted">
              Ladder: {WARRANTY.ladder.map((l) => `${l.part} ${l.months}mo`).join(" · ")}
            </p>
          </div>

          <div>
            <span className="text-[13px] font-semibold text-ink-muted">ACTIVITY</span>
            {user.testRides.length === 0 ? (
              <p className="text-[13px] text-ink-muted">No test rides</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1">
                {user.testRides.map((r) => (
                  <li key={r.id} className="text-[13px] text-ink">
                    Test ride · {r.model.name} · {r.store.name} · {r.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
