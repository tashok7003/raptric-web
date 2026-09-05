import { RetailerApplicationFlow } from "@/components/retailers/RetailerApplicationFlow";

// 7a — the retailer/BD funnel: territory check before any details,
// then the application, with a five-stage status tracker after
// (approve/reject drive it from /ops/retailers, the BD pipeline).
export default function RetailersPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-[26px] font-bold text-ink">
        Become a RAPTRIC retailer
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        ₹0 franchise fee, published margin, consignment demo stock, and
        training — for a store that wants to sell a bike people actually
        commute on.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
        {["₹0 fee", "Published margin", "Consignment demo stock", "Training included"].map(
          (term) => (
            <div
              key={term}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 text-center font-medium text-ink"
            >
              {term}
            </div>
          ),
        )}
      </div>

      <RetailerApplicationFlow />
    </div>
  );
}
