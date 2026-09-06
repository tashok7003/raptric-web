import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatBox } from "@/components/ui/StatBox";
import type { HomeSectionType, ProductGridConfig, StatBarConfig, HeroConfig } from "@/lib/homeSections";

interface HomeSectionData {
  id: string;
  type: HomeSectionType;
  heading: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  configJson: string;
}

// Homepage images come straight from an admin-entered URL (see
// HomeSectionForm) with no host restriction, unlike ProductCard's
// next/image usage — next/image throws and takes the whole page down for
// any host outside next.config.ts's remotePatterns, which is too fragile
// a failure mode for a field editors will be typing arbitrary URLs into.
export async function HomeSectionRenderer({ section }: { section: HomeSectionData }) {
  switch (section.type) {
    case "HERO":
      return <HeroSection section={section} />;
    case "STAT_BAR":
      return <StatBarSection section={section} />;
    case "PRODUCT_GRID":
      return <ProductGridSection section={section} />;
    case "PROMO":
      return <PromoSection section={section} />;
  }
}

function HeroSection({ section }: { section: HomeSectionData }) {
  const config: HeroConfig = JSON.parse(section.configJson || "{}");
  const hasImage = Boolean(section.imageUrl);
  return (
    <section className="relative isolate flex min-h-[440px] w-full items-end overflow-hidden md:min-h-[520px]">
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element -- see file header
        <img
          src={section.imageUrl ?? undefined}
          alt=""
          loading="eager"
          className="absolute inset-0 size-full object-cover object-[50%_62%]"
        />
      )}
      {/* The scrim exists to keep white text legible over a photo — without
          an image there's nothing to darken, and rendering it anyway paints
          an unexplained dark band over the plain page background. */}
      {hasImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,26,23,0.92)] via-[rgba(28,26,23,0.4)] to-transparent" />
      )}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:py-10">
        <div className="flex max-w-[44ch] flex-col gap-4">
          {section.heading && (
            <h1
              className={`font-display text-[36px] font-bold leading-[1.05] tracking-tight md:text-[44px] ${hasImage ? "text-white" : "text-ink"}`}
            >
              {section.heading}
            </h1>
          )}
          {section.body && (
            <p className={`max-w-[44ch] text-[16px] ${hasImage ? "text-white/75" : "text-ink-muted"}`}>
              {section.body}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {section.ctaHref && (
              <Link
                href={section.ctaHref}
                className="flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-5 py-2.5 font-body text-[14px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
              >
                {section.ctaLabel || "Learn more"}
              </Link>
            )}
            {config.secondaryCtaHref && (
              <Link
                href={config.secondaryCtaHref}
                className={`flex min-h-11 items-center justify-center px-1 py-2.5 font-body text-[14px] font-semibold hover:underline ${hasImage ? "text-white" : "text-ink"}`}
              >
                {config.secondaryCtaLabel || "Learn more"} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBarSection({ section }: { section: HomeSectionData }) {
  const config: StatBarConfig = JSON.parse(section.configJson || "{}");
  const items = config.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <StatBox items={items.map((label) => ({ label, icon: <CheckCircle2 className="size-5 text-action" /> }))} />
    </section>
  );
}

async function ProductGridSection({ section }: { section: HomeSectionData }) {
  const config: ProductGridConfig = JSON.parse(section.configJson || "{}");
  const kind = config.kind ?? "ALL";
  const bikes = await db.productModel.findMany({
    where: {
      status: "LIVE",
      kind: kind === "ALL" ? { in: ["EBIKE", "MBIKE"] } : kind,
    },
    orderBy: [{ bestSeller: "desc" }, { createdAt: "asc" }],
    take: config.limit ?? 8,
  });
  if (bikes.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 pb-16">
      <div className="mb-4 flex items-baseline justify-between">
        {section.heading && (
          <h2 className="font-body text-[22px] font-semibold text-ink">{section.heading}</h2>
        )}
        {section.ctaHref && (
          <Link href={section.ctaHref} className="text-[13px] font-semibold text-action hover:underline">
            {section.ctaLabel || "See all"} →
          </Link>
        )}
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
  );
}

function PromoSection({ section }: { section: HomeSectionData }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 pb-16">
      {section.imageUrl && (
        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-[var(--radius-card)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- see file header */}
          <img src={section.imageUrl} alt="" className="size-full object-cover" />
        </div>
      )}
      {section.heading && <h2 className="font-body text-[22px] font-semibold text-ink">{section.heading}</h2>}
      {section.body && <p className="mt-2 max-w-[65ch] text-[15px] text-ink-muted">{section.body}</p>}
      {section.ctaHref && (
        <Link href={section.ctaHref} className="mt-3 inline-block text-[13px] font-semibold text-action hover:underline">
          {section.ctaLabel || "Learn more"} →
        </Link>
      )}
    </section>
  );
}
