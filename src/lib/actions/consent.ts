"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CONSENT_COOKIE, type ConsentChoice } from "@/lib/consent";

// 11e — DPDP: the consent gate 8d's analytics events wait behind.
// Recorded as a cookie for every visitor, and additionally as a
// ConsentRecord row when someone is signed in, so the account's
// Privacy & data page has a real history to show.
export async function setConsentAction(choice: Exclude<ConsentChoice, null>) {
  const store = await cookies();
  store.set(CONSENT_COOKIE, choice, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const user = await getCurrentUser();
  if (user) {
    await db.consentRecord.create({
      data: { userId: user.id, kind: "analytics", granted: choice === "accepted" },
    });
  }
}
