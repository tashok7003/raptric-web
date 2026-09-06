import Link from "next/link";
import { Search, Bike, Zap, Wrench } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { label: "eBikes", href: "/bikes?type=ebike", icon: Zap },
  { label: "mBikes", href: "/bikes?type=mbike", icon: Bike },
  { label: "Accessories", href: "/accessories", icon: Wrench },
];

// The header's search icon (src/components/chrome/SiteHeader.tsx) had no
// onClick at all — a placeholder that never got wired to anything. Plain
// GET form rather than a client-side live-search overlay: works without
// JS, shareable/bookmarkable as a URL, and matches the rest of the
// storefront's server-rendered-first pages.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results = query
    ? await db.productModel.findMany({
        where: {
          status: "LIVE",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { bestSeller: "desc" },
      })
    : [];

  // Before a query exists there's nothing else on the page — this is
  // what fills that first screen instead of a heading and a lot of dark
  // empty space below one input.
  const popular = !query
    ? await db.productModel.findMany({
        where: { status: "LIVE", bestSeller: true },
        take: 3,
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-[28px] font-bold text-ink">
          What are you looking for?
        </h1>
        <form action="/search" method="get" className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search eBikes, mBikes, accessories…"
              autoFocus
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface-raised py-2.5 pl-10 pr-3 text-[15px] text-ink outline-none focus:border-action focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-action)_15%,transparent)]"
            />
          </div>
          <button
            type="submit"
            className="min-h-11 rounded-[var(--radius-control)] bg-action px-5 font-body text-[14px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
          >
            Search
          </button>
        </form>

        {!query && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-sunk"
              >
                <l.icon className="size-3.5 text-action" aria-hidden />
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {query && (
        <p className="mt-8 text-[13px] text-ink-muted">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query && results.length === 0 && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center text-[14px] text-ink-muted">
          Nothing matched &ldquo;{query}&rdquo;. Try a different model name, or browse{" "}
          <Link href="/bikes" className="text-action hover:underline">
            all eBikes
          </Link>
          .
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {results.map((b) => (
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

      {popular.length > 0 && (
        <div className="mt-12">
          <h2 className="text-center font-body text-[15px] font-semibold text-ink-muted">
            Popular models
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {popular.map((b) => (
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
        </div>
      )}
    </div>
  );
}
