import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatBox } from "@/components/ui/StatBox";
import { BatteryCharging, ShieldCheck, Star, Store } from "lucide-react";
import { WARRANTY, CANONICAL_CONTACT } from "@/lib/siteConfig";

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
      {/* Full-bleed hero: the photo's own composition puts the rider on the
          horizon with dark open ground below — so, same principle as an
          off-centre focus with a directional scrim, the veil sits over that
          already-dark ground rather than a side, and the rider/horizon stay
          fully clear above it. */}
      <section className="relative isolate flex min-h-[440px] w-full items-end overflow-hidden md:min-h-[520px]">
        <Image
          src="https://images.unsplash.com/photo-1519583272095-6433daf26b6e?q=80&w=1920&auto=format&fit=crop"
          alt="A rider mid-commute at sunrise"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,26,23,0.92)] via-[rgba(28,26,23,0.4)] to-transparent" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:py-10">
          <div className="flex max-w-[44ch] flex-col gap-4">
            <h1 className="font-display text-[36px] font-bold leading-[1.05] tracking-tight text-white md:text-[44px]">
              The commute, sorted.
            </h1>
            <p className="max-w-[44ch] text-[16px] text-white/75">
              ₹35,000 becomes ₹1,458 a month — no-cost EMI on every RAPTRIC
              eBike, backed by a {WARRANTY.headline} and {CANONICAL_CONTACT.addressLine}.
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
                className="flex min-h-11 items-center justify-center px-1 py-2.5 font-body text-[14px] font-semibold text-white hover:underline"
              >
                How EMI works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <StatBox
          items={[
            { label: "20+ retail partners", icon: <Store className="size-5 text-action" /> },
            { label: "4.4★ · 1,200+ riders", icon: <Star className="size-5 text-action" /> },
            { label: "60 km per charge", icon: <BatteryCharging className="size-5 text-action" /> },
            { label: WARRANTY.headline, icon: <ShieldCheck className="size-5 text-action" /> },
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
                image: b.heroImage,
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
