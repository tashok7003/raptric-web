import { db } from "@/lib/db";
import { NAV_ITEMS } from "./siteConfig";

export interface ResolvedNavItem {
  label: string;
  href: string;
  hasDropdown: boolean;
}

/**
 * The CMS nav editor (4h) writes NavItem rows and enforces the 5-item
 * cap in the tool itself (src/app/cms/nav). Until an editor has saved
 * anything, the header falls back to the locked default (2a) baked
 * into siteConfig.ts — so an empty table never means an empty nav.
 */
export async function getNavItems(): Promise<ResolvedNavItem[]> {
  const rows = await db.navItem.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    take: 5,
  });
  if (rows.length === 0) {
    return NAV_ITEMS.map((i) => ({ ...i }));
  }
  return rows.map((r) => ({ label: r.label, href: r.href, hasDropdown: r.hasDropdown }));
}
