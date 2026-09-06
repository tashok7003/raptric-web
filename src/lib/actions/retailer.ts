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

// ---------- Retailer self-service (/account/retailer) ----------

async function requireRetailer() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RETAILER" || !user.retailerId) {
    throw new Error("Not authorized");
  }
  return { ...user, retailerId: user.retailerId };
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "store"
  );
}

// Ops still owns approval/fulfillment (visible in /ops/retailers and
// /ops/orders) — this only lets a retailer put a new request in the
// queue from a past order, instead of the phone/WhatsApp round-trip
// the retailer review found every partner still relies on.
export async function reorderWholesaleOrderAction(orderId: string) {
  const user = await requireRetailer();
  const original = await db.wholesaleOrder.findUnique({ where: { id: orderId } });
  if (!original || original.retailerId !== user.retailerId) {
    throw new Error("Order not found");
  }

  await db.wholesaleOrder.create({
    data: {
      retailerId: user.retailerId,
      modelId: original.modelId,
      quantity: original.quantity,
      consignment: original.consignment,
      status: "PENDING",
    },
  });

  revalidatePath("/account/retailer");
}

export interface RetailerStoreInput {
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  hours: string;
}

export async function saveRetailerStoreAction(storeId: string | null, input: RetailerStoreInput) {
  const user = await requireRetailer();
  const data = {
    name: input.name,
    address: input.address,
    city: input.city,
    pincode: input.pincode,
    phone: input.phone,
    hoursJson: JSON.stringify({ "mon-sun": input.hours }),
  };

  if (storeId) {
    const existing = await db.store.findUnique({ where: { id: storeId } });
    if (!existing || existing.retailerId !== user.retailerId) {
      throw new Error("Store not found");
    }
    await db.store.update({ where: { id: storeId }, data });
  } else {
    await db.store.create({
      data: {
        ...data,
        retailerId: user.retailerId,
        slug: `${slugify(input.name)}-${user.retailerId.slice(-6)}`,
      },
    });
  }

  revalidatePath("/account/retailer");
}
