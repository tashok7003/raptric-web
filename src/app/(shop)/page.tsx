import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatBox } from "@/components/ui/StatBox";
import { BatteryCharging, ShieldCheck, Star, Store } from "lucide-react";

export const dynamic = "force-dynamic";

// Homepage — direction 1a: EMI-first hero + section order, since the PRD
// already settled EMI-first for the Practical Commuter majority (§3.1).
export default async function HomePage() {
  const bikes = await db.productModel.findMany({
    where: { status: "LIVE", kind: { in: ["EBIKE", "MBIKE"] } },
    orderBy: [{ bestSeller: "desc" }, { createdAt: "asc" }],
    take: 8,
  });

  return (
    <>
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-4">
          <h1 className="font-display text-[36px] font-bold leading-[1.05] tracking-tight text-ink md:text-[44px]">
            The commute, sorted.
          </h1>
          <p className="max-w-[44ch] text-[16px] text-ink-muted">
            ₹35,000 becomes ₹1,458 a month — no-cost EMI on every RAPTRIC
            eBike, backed by a 2-yr frame warranty and 20 stores across
            Maharashtra.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bikes?type=ebike"
              className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-5 py-2.5 font-body text-[14px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
            >
              Shop eBikes
            </Link>
            <Link
              href="/emi"
              className="flex min-h-11 items-center justify-center px-1 py-2.5 font-body text-[14px] font-semibold text-action hover:underline"
            >
              How EMI works →
            </Link>
          </div>
        </div>
        <div className="aspect-4/3 flex-1 rounded-[var(--radius-card)] bg-surface-sunk" />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <StatBox
          items={[
            { label: "20 retailers", icon: <Store className="size-5 text-action" /> },
            { label: "4.4★ · 1,200+ riders", icon: <Star className="size-5 text-action" /> },
            { label: "60 km per charge", icon: <BatteryCharging className="size-5 text-action" /> },
            { label: "2-yr frame warranty", icon: <ShieldCheck className="size-5 text-action" /> },
          ]}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-body text-[22px] font-semibold text-ink">
            eBikes &amp; mBikes
          </h2>
          <Link href="/compare" className="text-[13px] font-semibold text-action hover:underline">
            Compare all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {bikes.map((b) => (
            <ProductCard
              key={b.id}
              product={{
                id: b.id,
                slug: b.slug,
                name: b.name,
                kind: b.kind,
                bestSeller: b.bestSeller,
                isNew: b.isNew,
                price: b.price,
                mrp: b.mrp,
                emiMonthly: b.emiMonthly,
                emiTenureMonths: b.emiTenureMonths,
                rangeKm: b.rangeKm,
                gears: b.gears,
                wheelSize: b.wheelSize,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
