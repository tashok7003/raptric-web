"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { trackEvent } from "@/lib/actions/analytics";

export interface BookTestRideInput {
  modelId: string;
  storeId: string;
  slot: string; // ISO datetime
  name: string;
  phone: string;
}

// 3a — bike → store → slot → confirmation. Guest-bookable, same
// phone-upsert pattern as checkout, so a rider who books a ride and
// later buys sees both under the same account once they sign in.
export async function bookTestRideAction(input: BookTestRideInput) {
  const user = await db.user.upsert({
    where: { phone: input.phone },
    update: { name: input.name },
    create: { phone: input.phone, name: input.name },
  });

  const ride = await db.testRide.create({
    data: {
      userId: user.id,
      modelId: input.modelId,
      storeId: input.storeId,
      slot: new Date(input.slot),
      status: "CONFIRMED",
    },
    include: { model: true, store: true },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      templateKey: "ride_confirmed",
      channel: "sms",
      payloadJson: JSON.stringify({ model: ride.model.name, store: ride.store.name }),
    },
  });

  await trackEvent("test_ride_booked", { modelId: input.modelId, storeId: input.storeId });

  revalidatePath("/account/test-rides");
  return { rideId: ride.id };
}

export async function cancelTestRideAction(rideId: string) {
  await db.testRide.update({ where: { id: rideId }, data: { status: "CANCELLED" } });
  revalidatePath("/account/test-rides");
}
