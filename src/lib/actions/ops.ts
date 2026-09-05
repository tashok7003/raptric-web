"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

async function requireOps() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OPS_LEAD" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
}

// 5b — per-store stock, the integration 2d deliberately didn't fake:
// this is the retailer-updated "on this floor" count that PDP's
// tier-2 stock display (src/lib/stock.ts) reads, with a real
// timestamp that decays rather than a live feed.
export async function setStoreStockAction(storeId: string, modelId: string, count: number) {
  await requireOps();
  await db.storeStock.upsert({
    where: { storeId_modelId: { storeId, modelId } },
    update: { count },
    create: { storeId, modelId, count },
  });
  revalidatePath("/ops/stock");
}

export async function setServiceabilityAction(
  pincode: string,
  serviceable: boolean,
  freeDelivery: boolean,
) {
  await requireOps();
  await db.serviceability.upsert({
    where: { pincode },
    update: { serviceable, freeDelivery },
    create: { pincode, serviceable, freeDelivery },
  });
  revalidatePath("/ops/serviceability");
}
