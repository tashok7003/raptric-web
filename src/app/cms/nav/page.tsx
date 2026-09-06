import { db } from "@/lib/db";
import { NavEditor } from "@/components/cms/NavEditor";

export default async function CmsNavPage() {
  const items = await db.navItem.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Navigation</h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        Capped at 5 items. Reorder, rename, or remove anything below,
        including the original defaults — they&apos;re real rows now, not
        hardcoded. An empty list falls back to a safe built-in default
        rather than showing an empty nav.
      </p>
      <div className="mt-4">
        <NavEditor
          items={items.map((i) => ({
            id: i.id,
            label: i.label,
            href: i.href,
            hasDropdown: i.hasDropdown,
          }))}
        />
      </div>
    </div>
  );
}
