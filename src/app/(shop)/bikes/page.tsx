import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ui/ProductCard";
import { Chip } from "@/components/ui/Chip";
import { CompareTray } from "@/components/listing/CompareTray";
import { RideFinder } from "@/components/listing/RideFinder";

export const dynamic = "force-dynamic";

interface SearchParams {
  type?: string; // "ebike" | "mbike"
  budget?: string; // "under25" | "25to30" | "30plus"
  sort?: string; // "emi-asc" | "emi-desc"
}

const BUDGET_RANGES: Record<string, [number, number]> = {
  under25: [0, 25000],
  "25to30": [25000, 30000],
  "30plus": [30000, Infinity],
};

// Listing (1e) — filters that match how the 60% decide: price, range,
// gears, stock near me. The two-question picker (2b, RideFinder) was cut
// for v1 originally (12c: "11 SKUs don't justify it yet"), reinstated in
// a minimal form per the competitive audit (turn 15) — it reuses these
// same query params rather than inventing new recommendation logic, so
// the cost of having it is low even at today's catalog size.
export default async function BikesListingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const kind = params.type === "mbike" ? "MBIKE" : "EBIKE";
  const budgetRange = params.budget ? BUDGET_RANGES[params.budget] : undefined;

  const bikes = await db.productModel.findMany({
    where: {
      status: "LIVE",
      kind,
      ...(budgetRange
        ? { price: { gte: budgetRange[0], lt: budgetRange[1] === Infinity ? undefined : budgetRange[1] } }
        : {}),
    },
    orderBy:
      params.sort === "emi-desc"
        ? { price: "desc" }
        : { price: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24">
      <p className="text-[13px] text-ink-muted">
        Home / Shop / {kind === "EBIKE" ? "eBikes" : "mBikes"}
      </p>
      <h1 className="mt-1 font-body text-[22px] font-semibold text-ink">
        {kind === "EBIKE" ? "eBikes" : "mBikes"} · {bikes.length} model
        {bikes.length === 1 ? "" : "s"}
      </h1>

      <RideFinder />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FilterChip
          label="eBikes"
          active={kind === "EBIKE"}
          href={{ ...params, type: "ebike" }}
        />
        <FilterChip
          label="mBikes"
          active={kind === "MBIKE"}
          href={{ ...params, type: "mbike" }}
        />
        <span className="mx-1 h-4 w-px bg-[var(--color-border)]" />
        <FilterChip
          label="Under ₹25k"
          active={params.budget === "under25"}
          href={{ ...params, budget: params.budget === "under25" ? undefined : "under25" }}
        />
        <FilterChip
          label="₹25k–30k"
          active={params.budget === "25to30"}
          href={{ ...params, budget: params.budget === "25to30" ? undefined : "25to30" }}
        />
        <FilterChip
          label="₹30k+"
          active={params.budget === "30plus"}
          href={{ ...params, budget: params.budget === "30plus" ? undefined : "30plus" }}
        />
      </div>

      {bikes.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center text-[14px] text-ink-muted">
          Nothing in this range yet. Try a wider budget, or{" "}
          <Link href="/bikes" className="text-action hover:underline">
            see all models
          </Link>
          .
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
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
                outOfStock: b.globalStock <= 0,
              }}
            />
          ))}
        </div>
      )}

      <CompareTray />
    </div>
  );
}

function FilterChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: Record<string, string | undefined>;
}) {
  const qs = new URLSearchParams(
    Object.entries(href).filter(([, v]) => v) as [string, string][],
  ).toString();
  return (
    <Link href={`/bikes${qs ? `?${qs}` : ""}`}>
      <Chip variant={active ? "selected" : "default"}>{label}</Chip>
    </Link>
  );
}
