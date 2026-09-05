import Link from "next/link";
import { WARRANTY } from "@/lib/siteConfig";

// Warranty policy (4e) — a summary table above the legal text, the fix
// from turn 6: the PDP chip, trust bars and this page now agree on one
// ladder (WARRANTY.headline everywhere, not a hand-typed duplicate).
export default function WarrantyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-[24px] font-bold text-ink">
        Warranty &amp; activation
      </h1>

      <table className="mt-6 w-full border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Component</th>
            <th className="py-2">Coverage</th>
          </tr>
        </thead>
        <tbody>
          {WARRANTY.ladder.map((l) => (
            <tr key={l.part} className="border-b border-[var(--color-border)]">
              <td className="py-2 font-medium text-ink">{l.part}</td>
              <td className="py-2 tabular-nums">{l.months} months</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-[13px] text-ink-muted">
        Claim pickup fee: ₹{WARRANTY.claimPickupFee}, payable to the rider
        only if the claim is approved.
      </p>

      <Link
        href="/account"
        className="mt-6 inline-block rounded-[var(--radius-control)] bg-action px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
      >
        Activate my warranty
      </Link>

      <p className="mt-8 text-[15px] leading-relaxed text-ink-muted">
        Warranty covers manufacturing defects only and is void for damage
        from accidents, unauthorised repairs, or use outside normal
        commuting conditions. Register your frame number within 3 days of
        purchase to keep your claim window open.
      </p>
    </div>
  );
}
