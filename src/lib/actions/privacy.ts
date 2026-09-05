"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

// 11e — DPDP: self-serve export and the deletion queue are manual for
// the first 90 days (12a/12d), so this logs a request an ops person
// actions rather than performing it automatically.
export async function requestDataAction(kind: "export" | "delete") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: kind === "export" ? "data_export_requested" : "data_deletion_requested",
      targetType: "User",
      targetId: user.id,
    },
  });

  revalidatePath("/account/privacy");
}
