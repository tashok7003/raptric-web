"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

function generateClaimNo() {
  return `CLM-${Date.now().toString(36).toUpperCase()}`;
}

export async function submitClaimAction(input: {
  bikeId: string;
  component: "frame" | "motor" | "battery";
  description: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const claim = await db.claim.create({
    data: {
      claimNo: generateClaimNo(),
      bikeId: input.bikeId,
      userId: user.id,
      component: input.component,
      description: input.description,
      slaDueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  return { claimId: claim.id };
}

// Now that the support console exists, only staff can decide — a
// rider driving their own claim decision was a real gap when this was
// still a sandbox stand-in for a console that didn't exist yet.
export async function decideClaimAction(
  claimId: string,
  decision: "APPROVED" | "DECLINED",
  declineReason?: string,
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT_AGENT" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }

  await db.claim.update({
    where: { id: claimId },
    data: {
      status: decision,
      declineReason: decision === "DECLINED" ? declineReason : undefined,
    },
  });
  revalidatePath(`/account/claims/${claimId}`);
}
