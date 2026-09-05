"use server";

import { db } from "@/lib/db";
import { getConsentChoice } from "@/lib/consent";
import { getCurrentUser } from "@/lib/session";

/**
 * 8d — ~22 funnel events, each tied to a question someone will ask.
 * Only a handful are wired to real UI so far (add_to_cart,
 * checkout_started, order_placed, test_ride_booked, emi_declined) —
 * the full catalogue is a content/planning artifact (which events, what
 * props, which dashboard) rather than something this pass builds out
 * wholesale. Every call is a no-op unless analytics consent was granted
 * (12c: "8d's events cannot fire before 11e's gate exists").
 */
export async function trackEvent(name: string, props: Record<string, unknown> = {}) {
  const consent = await getConsentChoice();
  if (consent !== "accepted") return;

  const user = await getCurrentUser();
  await db.analyticsEvent.create({
    data: { userId: user?.id, name, propsJson: JSON.stringify(props) },
  });
}
