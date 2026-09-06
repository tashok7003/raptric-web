export type HomeSectionType = "HERO" | "STAT_BAR" | "PRODUCT_GRID" | "PROMO";

export const HOME_SECTION_TYPES: { value: HomeSectionType; label: string; description: string }[] = [
  { value: "HERO", label: "Hero banner", description: "Full-bleed image with a headline and a primary/secondary link." },
  { value: "STAT_BAR", label: "Trust bar", description: "A row of short stat/trust callouts (2-4 items)." },
  { value: "PRODUCT_GRID", label: "Product grid", description: "Live eBikes/mBikes pulled from the catalogue, with a heading and a \"see all\" link." },
  { value: "PROMO", label: "Promo block", description: "A free-form heading, body text, optional image, and optional link — for anything else." },
];

export interface HeroConfig {
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export interface StatBarConfig {
  items: string[];
}

export interface ProductGridConfig {
  kind: "ALL" | "EBIKE" | "MBIKE";
  limit: number;
}

/** Sensible starting fields for a brand-new section of this type — the
 * editor immediately has something legible to work from instead of an
 * all-blank form. */
export function defaultsFor(type: HomeSectionType): {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  config: HeroConfig | StatBarConfig | ProductGridConfig | Record<string, never>;
} {
  switch (type) {
    case "HERO":
      return {
        heading: "New headline",
        body: "Supporting line goes here.",
        ctaLabel: "Shop now",
        ctaHref: "/bikes",
        config: {} satisfies HeroConfig,
      };
    case "STAT_BAR":
      return { config: { items: ["New stat"] } satisfies StatBarConfig };
    case "PRODUCT_GRID":
      return {
        heading: "Featured bikes",
        ctaLabel: "See all",
        ctaHref: "/bikes",
        config: { kind: "ALL", limit: 8 } satisfies ProductGridConfig,
      };
    case "PROMO":
      return { heading: "New section", body: "", config: {} };
  }
}
