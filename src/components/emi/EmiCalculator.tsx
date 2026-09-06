"use client";

import { useMemo, useState } from "react";
import { EMI } from "@/lib/siteConfig";

// Illustrative only — RAPTRIC has one real lender (Bajaj Finserv) and one
// real product (0% interest, split over a fixed tenure). This APR exists
// only to make "no-cost" legible by contrast against a typical financed
// purchase; it is not a second lender or a real quote. Swap for the
// actual comparison terms once the business has them (see P1 backlog).
const ILLUSTRATIVE_APR = 18;

function standardEmi(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const PRESETS = [
  { label: "RAPTRIC M14 · ₹14,500", price: 14500 },
  { label: "RAPTRIC X26 · ₹29,500", price: 29500 },
  { label: "RAPTRIC L27+ · ₹35,000", price: 35000 },
  { label: "RAPTRIC L27 Pro · ₹39,500", price: 39500 },
];

export function EmiCalculator() {
  const [price, setPrice] = useState(PRESETS[2].price);
  const [tenure, setTenure] = useState<(typeof EMI.tenuresMonths)[number]>(24);
  const [downPct, setDownPct] = useState(0);

  const { downPayment, noCostMonthly, marketMonthly, noCostTotal, marketTotal, savings } =
    useMemo(() => {
      const downPayment = Math.round((price * downPct) / 100);
      const financed = price - downPayment;
      const noCostMonthly = Math.round(financed / tenure);
      const marketMonthly = Math.round(standardEmi(financed, ILLUSTRATIVE_APR, tenure));
      const noCostTotal = downPayment + noCostMonthly * tenure;
      const marketTotal = downPayment + marketMonthly * tenure;
      return {
        downPayment,
        noCostMonthly,
        marketMonthly,
        noCostTotal,
        marketTotal,
        savings: marketTotal - noCostTotal,
      };
    }, [price, tenure, downPct]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="font-body text-label uppercase text-ink-muted">
          Bike price
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.price}
              type="button"
              aria-pressed={price === p.price}
              onClick={() => setPrice(p.price)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${
                price === p.price
                  ? "border-action bg-[color-mix(in_srgb,var(--color-action)_10%,white)] text-action"
                  : "border-[var(--color-border)] text-ink hover:bg-surface-sunk"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-body text-label uppercase text-ink-muted">
          Tenure
        </label>
        <div className="flex gap-2">
          {EMI.tenuresMonths.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tenure === t}
              onClick={() => setTenure(t)}
              className={`min-h-11 flex-1 rounded-[var(--radius-control)] border px-3 text-[14px] font-semibold ${
                tenure === t
                  ? "border-action bg-[color-mix(in_srgb,var(--color-action)_10%,white)] text-action"
                  : "border-[var(--color-border)] text-ink hover:bg-surface-sunk"
              }`}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="down-payment"
            className="font-body text-label uppercase text-ink-muted"
          >
            Down payment
          </label>
          <span className="font-display text-[14px] font-bold tabular-nums text-ink">
            {downPct}% · ₹{downPayment.toLocaleString("en-IN")}
          </span>
        </div>
        <input
          id="down-payment"
          type="range"
          min={0}
          max={50}
          step={5}
          value={downPct}
          onChange={(e) => setDownPct(Number(e.target.value))}
          className="w-full accent-[var(--color-action)]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border-2 border-action bg-[color-mix(in_srgb,var(--color-action)_6%,white)] p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-action">
            RAPTRIC no-cost EMI
          </p>
          <p className="mt-2 font-display text-[28px] font-bold tabular-nums text-ink">
            ₹{noCostMonthly.toLocaleString("en-IN")}
            <span className="text-[14px] font-normal text-ink-muted">/mo</span>
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            {tenure} months · 0% interest · total ₹{noCostTotal.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-muted">
            Typical financed purchase
          </p>
          <p className="mt-2 font-display text-[28px] font-bold tabular-nums text-ink">
            ₹{marketMonthly.toLocaleString("en-IN")}
            <span className="text-[14px] font-normal text-ink-muted">/mo</span>
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            {tenure} months · {ILLUSTRATIVE_APR}% APR (illustrative) · total ₹
            {marketTotal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {savings > 0 && (
        <p className="text-center text-[14px] font-semibold text-action">
          No-cost EMI saves you ₹{savings.toLocaleString("en-IN")} over the same tenure.
        </p>
      )}

      <p className="text-[12px] text-ink-muted">
        The {ILLUSTRATIVE_APR}% APR comparison is illustrative, for scale only — it isn&apos;t a
        second loan offer. RAPTRIC&apos;s only real financing partner today is {EMI.provider}, at
        0% interest over {EMI.tenuresMonths.join("/")} months.
      </p>
    </div>
  );
}
