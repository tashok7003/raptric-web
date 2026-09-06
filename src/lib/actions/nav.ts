"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

const NAV_CAP = 5;

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MARKETING_EDITOR" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
}

export interface AddNavItemResult {
  ok: boolean;
  error?: "CAP_REACHED";
}

// 4h — "nav editor with the 5-item cap enforced in the tool" (turn 4,
// restated in 8e: "no screen invented a sixth slot — not the bell, not
// the language switch"). The cap is enforced here, not just in the UI.
export async function addNavItemAction(label: string, href: string): Promise<AddNavItemResult> {
  await requireEditor();
  const count = await db.navItem.count({ where: { parentId: null } });
  if (count >= NAV_CAP) return { ok: false, error: "CAP_REACHED" };

  await db.navItem.create({ data: { label, href, order: count } });
  revalidatePath("/cms/nav");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeNavItemAction(id: string) {
  await requireEditor();
  await db.navItem.delete({ where: { id } });
  revalidatePath("/cms/nav");
  revalidatePath("/", "layout");
}

// Previously the CMS could only append past whatever the locked default
// (2a) already was — renaming, reordering, or removing one of the
// original items meant it silently kept living in siteConfig.ts,
// invisible to the tool that's supposed to own it. The defaults are now
// seeded as real NavItem rows so they show up here as editable from day
// one, same as anything an editor adds afterwards.
export async function updateNavItemAction(id: string, label: string, href: string) {
  await requireEditor();
  await db.navItem.update({ where: { id }, data: { label, href } });
  revalidatePath("/cms/nav");
  revalidatePath("/", "layout");
}

export async function moveNavItemAction(id: string, direction: "up" | "down") {
  await requireEditor();
  const items = await db.navItem.findMany({ where: { parentId: null }, orderBy: { order: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= items.length) return;

  const a = items[index];
  const b = items[swapWith];
  await db.$transaction([
    db.navItem.update({ where: { id: a.id }, data: { order: b.order } }),
    db.navItem.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  revalidatePath("/cms/nav");
  revalidatePath("/", "layout");
}
