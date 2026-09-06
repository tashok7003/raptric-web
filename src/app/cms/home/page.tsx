import { db } from "@/lib/db";
import { HomeSectionList } from "@/components/cms/HomeSectionList";

export const dynamic = "force-dynamic";

// Homepage section builder — sections render top-to-bottom by `order` on
// the real homepage (src/app/(shop)/page.tsx), same DRAFT/LIVE status
// convention as products/journal/FAQ.
export default async function CmsHomePage() {
  const sections = await db.homeSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Homepage</h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        Sections render top to bottom on the live homepage. Draft sections are hidden from riders.
      </p>
      <div className="mt-4">
        <HomeSectionList
          sections={sections.map((s) => ({
            id: s.id,
            type: s.type as "HERO" | "STAT_BAR" | "PRODUCT_GRID" | "PROMO",
            status: s.status as "DRAFT" | "LIVE",
            heading: s.heading,
          }))}
        />
      </div>
    </div>
  );
}
