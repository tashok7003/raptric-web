import type { Metadata } from "next";
import { EMI, WARRANTY } from "@/lib/siteConfig";
import { EmiCalculator } from "@/components/emi/EmiCalculator";

export const metadata: Metadata = {
  title: "How EMI works",
  description: `No-cost EMI on every RAPTRIC eBike — split the price over ${EMI.tenuresMonths.join("/")} months at 0% interest through ${EMI.provider}.`,
};

// This route was linked from the homepage hero and every PDP ("how EMI
// works") but never actually existed — a 404 behind the site's own
// headline pitch. Built now, including the down-payment/APR comparison
// the competitive review asked for, using illustrative-only numbers
// (see EmiCalculator) since there's no second real lender to quote.
export default function EmiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-[32px] font-bold leading-tight text-ink">
        No-cost EMI, explained.
      </h1>
      <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-ink-muted">
        Every RAPTRIC eBike splits into equal monthly payments over{" "}
        {EMI.tenuresMonths.join(", ")} months through {EMI.provider} — at 0%
        interest. You pay exactly the sticker price, just spread out. No
        processing markup hidden in the monthly figure, no APR to calculate.
      </p>

      <div className="mt-10 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-5">
        <h2 className="font-body text-[16px] font-bold text-ink">Try it</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Pick a bike, a tenure, and an optional down payment to see the monthly cost.
        </p>
        <div className="mt-5">
          <EmiCalculator />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 text-[14px] text-ink-muted">
        <p>
          <span className="font-semibold text-ink">Eligibility:</span> most riders
          with a valid PAN and a working phone number qualify at checkout —
          Bajaj Finserv confirms instantly, no paperwork to mail in.
        </p>
        <p>
          <span className="font-semibold text-ink">Warranty either way:</span>{" "}
          every bike carries the same {WARRANTY.headline}, whether you pay in
          full or over {EMI.tenuresMonths[EMI.tenuresMonths.length - 1]} months.
        </p>
      </div>
    </div>
  );
}
