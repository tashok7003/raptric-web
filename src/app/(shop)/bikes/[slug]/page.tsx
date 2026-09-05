import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Accordion } from "@/components/ui/Accordion";
import { StatusCard } from "@/components/ui/StatusCard";
import { WARRANTY } from "@/lib/siteConfig";
import { computeStockDisplay } from "@/lib/stock";
import { AddToCartBar } from "@/components/pdp/AddToCartBar";
import { AddToCartButton } from "@/components/pdp/AddToCartButton";
import { ShieldCheck, Truck, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

// PDP, per 2d's fix — sticky anchor strip in AddToCartBar's scroll
// listener, 3 accordions instead of 5 full sections, and honest
// tier-2 stock copy (13b) instead of a live-inventory promise the CMS
// can't back.
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await db.productModel.findUnique({
    where: { slug },
    include: {
      storeStock: { include: { store: true } },
      reviews: { where: { status: "PUBLISHED" }, take: 5 },
    },
  });

  if (!model || model.status !== "LIVE") notFound();

  const stock = computeStockDisplay(
    model.storeStock.map((s) => ({
      storeName: s.store.name,
      count: s.count,
      updatedAt: s.updatedAt,
    })),
    model.globalStock,
  );

  const compareWith = await db.productModel.findMany({
    where: { kind: model.kind, status: "LIVE", id: { not: model.id } },
    take: 2,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28">
      <Link href={`/bikes?type=${model.kind === "EBIKE" ? "ebike" : "mbike"}`} className="text-[13px] text-ink-muted hover:text-action">
        ← Back to {model.kind === "EBIKE" ? "eBikes" : "mBikes"}
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)] bg-surface-sunk">
          {model.heroImage ? (
            <Image
              src={model.heroImage}
              alt={model.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {model.isNew && (
            <span className="w-fit rounded-[3px] bg-[color-mix(in_srgb,var(--color-action)_12%,white)] px-1.5 py-0.5 text-[10px] font-bold text-action">
              NEW
            </span>
          )}
          <h1 className="font-display text-[24px] font-bold text-ink">
            {model.name}
          </h1>

          {model.kind === "EBIKE" && model.emiMonthly ? (
            <>
              <div className="font-display text-[24px] font-bold tabular-nums text-ink">
                ₹{model.emiMonthly.toLocaleString("en-IN")}
                <span className="text-[13px] font-normal text-ink-muted">/mo</span>
              </div>
              <span className="text-[13px] text-ink-muted">
                {model.emiTenureMonths} months · Bajaj Finance ·{" "}
                <Link href="/emi" className="text-action hover:underline">
                  how EMI works
                </Link>
              </span>
              <div className="flex items-baseline gap-2">
                {model.mrp > model.price && (
                  <span className="text-[13px] text-ink-muted/60 line-through">
                    ₹{model.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-[13px] font-semibold text-ink-muted">
                  ₹{model.price.toLocaleString("en-IN")}
                </span>
              </div>
            </>
          ) : (
            <div className="font-display text-[24px] font-bold tabular-nums text-ink">
              ₹{model.price.toLocaleString("en-IN")}
            </div>
          )}

          <div className="hidden gap-2 md:flex">
            <AddToCartButton modelId={model.id} outOfStock={stock.state === "out-of-stock"} className="flex-1" />
            <Link
              href={`/test-ride?model=${model.slug}`}
              className="flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-control)] border-[1.5px] border-ink px-4 py-2.5 font-body text-[13px] font-semibold text-ink hover:bg-surface-sunk"
            >
              Book a test ride
            </Link>
          </div>

          <StatusCard
            tone={stock.tone}
            label="Availability"
            title={stock.label}
          />

          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-[999px] border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-ink-muted">
              <ShieldCheck className="size-3.5" aria-hidden /> {WARRANTY.headline}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[999px] border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-ink-muted">
              <Truck className="size-3.5" aria-hidden /> Free assembly
            </span>
            <span className="inline-flex items-center gap-1 rounded-[999px] border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-ink-muted">
              <PackageCheck className="size-3.5" aria-hidden /> Quality-checked before dispatch
            </span>
          </div>
        </div>
      </div>

      {model.kind === "EBIKE" && (
        <section id="why" className="mt-10 scroll-mt-20">
          <h2 className="mb-3 font-body text-[18px] font-bold text-ink">
            Why this bike
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <WhyTile label={`${model.rangeKm ?? "—"} km per charge`} />
            <WhyTile label="Gear-upgrade ready" />
            <WhyTile label="4 hr charge · 30 kg" />
          </div>
        </section>
      )}

      <section id="specs" className="mt-8 scroll-mt-20">
        <Accordion
          items={[
            {
              id: "full-specs",
              title: "Full specifications",
              content: <SpecsTable specsJson={model.specsJson} />,
            },
            {
              id: "warranty",
              title: "Warranty & service",
              content: (
                <ul className="flex flex-col gap-1">
                  {WARRANTY.ladder.map((l) => (
                    <li key={l.part}>
                      {l.part}: {l.months} months
                    </li>
                  ))}
                  <li>Claim pickup fee: ₹{WARRANTY.claimPickupFee}</li>
                </ul>
              ),
            },
            {
              id: "reviews",
              title: `Reviews (${model.reviews.length})`,
              content:
                model.reviews.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {model.reviews.map((r) => (
                      <li key={r.id}>
                        <span aria-label={`${r.rating} out of 5 stars`}>
                          <span aria-hidden>{"★".repeat(r.rating)}</span>
                        </span>
                        {r.body && <p className="mt-1">{r.body}</p>}
                      </li>
                    ))}
                  </ul>
                ) : undefined,
              emptyReason: model.reviews.length === 0 ? "no reviews yet" : undefined,
            },
          ]}
        />
      </section>

      {compareWith.length > 0 && (
        <section id="compare" className="mt-8 scroll-mt-20">
          <div className="flex items-baseline justify-between">
            <h2 className="font-body text-[18px] font-bold text-ink">
              Compare with
            </h2>
            <Link
              href={`/compare?ids=${[model.id, ...compareWith.map((m) => m.id)].join(",")}`}
              className="text-[13px] text-action hover:underline"
            >
              {compareWith.map((m) => m.name).join(" · ")} →
            </Link>
          </div>
        </section>
      )}

      <AddToCartBar
        modelId={model.id}
        modelSlug={model.slug}
        name={model.name}
        priceLabel={
          model.kind === "EBIKE" && model.emiMonthly
            ? `₹${model.emiMonthly.toLocaleString("en-IN")}/mo`
            : `₹${model.price.toLocaleString("en-IN")}`
        }
        subLabel={`₹${model.price.toLocaleString("en-IN")} total`}
        outOfStock={stock.state === "out-of-stock"}
      />
    </div>
  );
}

function WhyTile({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 text-center text-[13px] font-medium text-ink">
      {label}
    </div>
  );
}

function SpecsTable({ specsJson }: { specsJson: string }) {
  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(specsJson);
  } catch {
    // fall through with empty specs
  }
  const entries = Object.entries(specs);
  if (entries.length === 0) {
    return <p>Specifications are being finalised for this model.</p>;
  }
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-muted">{k}</dt>
          <dd className="font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
