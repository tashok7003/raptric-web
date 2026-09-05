"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface RetailerApplicationInput {
  name: string;
  ownerName: string;
  phone: string;
  territoryPin: string;
}

// 7a — territory check before any details, using the demand already on
// file (3f/6a's coverage requests) as the pitch. The check here is a
// simple existing-retailer lookup by pincode; the fuller "N riders have
// asked us to come here" demand map is 3f/6a's job, not duplicated here.
export async function checkTerritoryAction(pincode: string) {
  const existing = await db.retailer.findFirst({
    where: { territoryPin: pincode, status: { in: ["APPROVED", "LIVE"] } },
  });
  return { taken: !!existing };
}

export async function submitRetailerApplicationAction(input: RetailerApplicationInput) {
  const retailer = await db.retailer.create({
    data: {
      name: input.name,
      ownerName: input.ownerName,
      phone: input.phone,
      territoryPin: input.territoryPin,
      status: "APPLIED",
    },
  });
  revalidatePath("/ops/retailers");
  return { retailerId: retailer.id };
}

async function requireBd() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OPS_LEAD" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
}

export async function setRetailerStatusAction(
  retailerId: string,
  status: "TERRITORY_CHECKED" | "DOCS" | "APPROVED" | "LIVE" | "REJECTED",
) {
  await requireBd();
  await db.retailer.update({ where: { id: retailerId }, data: { status } });
  revalidatePath("/ops/retailers");
}
