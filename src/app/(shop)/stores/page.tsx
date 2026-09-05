import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, Phone } from "lucide-react";
import { CANONICAL_CONTACT } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

// Store finder (1j) — list-first, not map-first; the audit that flagged
// this called it "directly fixes an audit finding." This lists RAPTRIC's
// own store(s) — the growing retail-partner network is a separate
// concept (see the Retailer model / BD pipeline), not listed here yet.
export default async function StoreListPage() {
  const stores = await db.store.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-display text-[22px] font-bold text-ink">Find a store</h1>
      <p className="mt-1 text-[14px] text-ink-muted">
        Our own store, plus {CANONICAL_CONTACT.addressLine} — test rides,
        service and collect-in-store, all walk-in.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {stores.map((store) => {
          const hours = JSON.parse(store.hoursJson) as Record<string, string>;
          return (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 hover:border-ink"
            >
              <div className="flex flex-col gap-1">
                <span className="font-body text-[15px] font-semibold text-ink">
                  {store.name}
                </span>
                <span className="flex items-center gap-1 text-[13px] text-ink-muted">
                  <MapPin className="size-3.5" aria-hidden /> {store.address}
                </span>
                <span className="flex items-center gap-1 text-[13px] text-ink-muted">
                  <Phone className="size-3.5" aria-hidden /> {store.phone}
                </span>
              </div>
              <span className="text-[12px] text-ink-muted">
                {Object.values(hours)[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
