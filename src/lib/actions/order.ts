"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NEXT_ORDER_STATUS } from "@/lib/orderStatus";
import { WARRANTY, CANCELLATION_FEE, RETURN_WINDOW_DAYS } from "@/lib/siteConfig";
import type { OrderStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/session";

/**
 * The order-confirmation page is reachable by anyone with the link
 * (guest checkout, no sign-in required) — fine for viewing, same as a
 * courier tracking link, and the mutating actions below stay open to
 * an anonymous caller for the same reason (the link is the guest's
 * only credential; this is the standard trust model for guest-checkout
 * order pages). What was a real gap: a *different signed-in* rider, or
 * a stranger, mutating an order that belongs to someone else's
 * account. Blocked here; staff can still act on any order.
 */
async function requireOrderAccess(orderId: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  const user = await getCurrentUser();
  const isStaff = user?.role === "OPS_LEAD" || user?.role === "ADMIN";
  if (user && !isStaff && order.userId !== user.id) {
    throw new Error("Not authorized");
  }
  return order;
}

/**
 * No courier AWB integration yet (12d's launch-blocker list), so order
 * progress is advanced here rather than by a real webhook. This is a
 * stand-in for what a courier/ops event would trigger — same
 * sandbox-mode convention as payments and OTP.
 */
export async function advanceOrderStatusAction(orderId: string) {
  const order = await requireOrderAccess(orderId);
  const next = NEXT_ORDER_STATUS[order.status];
  if (!next) return;
  await db.order.update({ where: { id: orderId }, data: { status: next as OrderStatus } });
  revalidatePath(`/order-confirmation/${orderId}`);
  revalidatePath("/ops/orders");
}

function generateFrameNumber() {
  return `RP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

// 3c — "activate your warranty in 2 minutes" (12a's order_delivered
// message) is what actually creates the OwnedBike row the account hub,
// claims and the safety-recall lookup all depend on.
export async function activateWarrantyAction(orderId: string) {
  await requireOrderAccess(orderId);
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { model: true } } },
  });
  if (order.status !== "DELIVERED") throw new Error("Order not delivered yet.");

  const purchaseDate = new Date();
  const addMonths = (n: number) => {
    const d = new Date(purchaseDate);
    d.setMonth(d.getMonth() + n);
    return d;
  };
  const frame = WARRANTY.ladder.find((l) => l.part === "Frame")!.months;
  const motor = WARRANTY.ladder.find((l) => l.part === "Motor")!.months;
  const battery = WARRANTY.ladder.find((l) => l.part === "Battery")!.months;

  for (const item of order.items) {
    if (item.model.kind !== "EBIKE" && item.model.kind !== "MBIKE") continue;
    for (let i = 0; i < item.quantity; i++) {
      await db.ownedBike.create({
        data: {
          userId: order.userId,
          modelId: item.modelId,
          frameNumber: generateFrameNumber(),
          purchaseDate,
          frameWarrantyUntil: addMonths(frame),
          motorWarrantyUntil: addMonths(motor),
          batteryWarrantyUntil: addMonths(battery),
        },
      });
    }
  }

  revalidatePath("/account");
  revalidatePath(`/order-confirmation/${orderId}`);
}

export async function requestReturnAction(
  orderId: string,
  kind: "return" | "cancel" | "exchange",
  reason?: string,
) {
  const order = await requireOrderAccess(orderId);
  const feeCharged = kind === "cancel" ? CANCELLATION_FEE : 0;

  await db.returnRequest.upsert({
    where: { orderId },
    update: { kind, reason, feeCharged },
    create: { orderId, kind, reason, feeCharged },
  });

  if (kind === "cancel") {
    await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  } else if (kind === "return") {
    await db.order.update({ where: { id: orderId }, data: { status: "RETURNED" } });
  }

  revalidatePath(`/order-confirmation/${orderId}`);
  return { feeCharged, returnWindowDays: RETURN_WINDOW_DAYS };
}
