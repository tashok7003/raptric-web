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
        Capped at 5 items (2a's lock). Empty means the site falls back to
        the default locked nav — nothing breaks either way.
      </p>
      <div className="mt-4">
        <NavEditor
          items={items.map((i) => ({ id: i.id, label: i.label, href: i.href }))}
        />
      </div>
    </div>
  );
}
