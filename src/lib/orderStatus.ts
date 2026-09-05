import type { Step } from "@/components/ui/StepTracker";

const ORDER_SEQUENCE = ["PAID", "ASSEMBLED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

const LABELS: Record<(typeof ORDER_SEQUENCE)[number], string> = {
  PAID: "Paid",
  ASSEMBLED: "Assembled at your nearest store",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

/** 3c — one status model, read the same way by the rider's tracking
 * view and ops's order list (5b) so the two never drift apart. */
export function orderTrackerSteps(status: string): Step[] {
  const index = ORDER_SEQUENCE.indexOf(status as (typeof ORDER_SEQUENCE)[number]);
  const isTerminal = index === ORDER_SEQUENCE.length - 1;
  return ORDER_SEQUENCE.map((s, i) => ({
    label: LABELS[s],
    state: i < index || (isTerminal && i === index) ? "done" : i === index ? "current" : "upcoming",
  }));
}

export const NEXT_ORDER_STATUS: Partial<Record<string, string>> = {
  PAID: "ASSEMBLED",
  ASSEMBLED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};
