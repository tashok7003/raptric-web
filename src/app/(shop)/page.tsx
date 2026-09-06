import { db } from "@/lib/db";
import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import type { HomeSectionType } from "@/lib/homeSections";

export const dynamic = "force-dynamic";

// Homepage — sections are CMS-managed (see /cms/home,
// src/components/home/HomeSectionRenderer.tsx) rather than hardcoded, so
// an editor can add/reorder/remove sections without a code change. The
// section order/content itself is intentionally not a design token (8e) —
// only the fact that it's editable is.
export default async function HomePage() {
  const sections = await db.homeSection.findMany({
    where: { status: "LIVE" },
    orderBy: { order: "asc" },
  });

  return (
    <>
      {sections.map((s) => (
        <HomeSectionRenderer
          key={s.id}
          section={{
            id: s.id,
            type: s.type as HomeSectionType,
            heading: s.heading,
            body: s.body,
            imageUrl: s.imageUrl,
            ctaLabel: s.ctaLabel,
            ctaHref: s.ctaHref,
            configJson: s.configJson,
          }}
        />
      ))}
    </>
  );
}
