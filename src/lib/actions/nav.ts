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
