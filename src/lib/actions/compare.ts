"use server";

import { db } from "@/lib/db";

// Looked up fresh rather than trusting whatever the host page already
// had loaded — CompareTray previously took an id->name map built only
// from the current page's own (often filtered) product list, so a
// selection made under one filter, or referencing a product since
// deleted/recreated, rendered as a raw database id with no name at all.
export async function getCompareModelsAction(ids: string[]): Promise<{ id: string; name: string }[]> {
  if (ids.length === 0) return [];
  return db.productModel.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
}
