/**
 * Tier-2 stock (13b) — replaces the earlier "call to confirm" copy.
 * Three tiers: network (ops-managed global count), on-this-floor
 * (retailer-updated per store, one tap on the store-floor screen),
 * reserved (system-held). The count carries a timestamp and decays:
 * under 12h it shows, 12-48h it greys, past 48h it hides. When the real
 * per-store integration lands (deliberately out of scope for v1, 12c),
 * the timestamp says "live" and nothing else about the display changes.
 */

export interface StoreStockRow {
  storeName: string;
  count: number;
  updatedAt: Date;
}

export type StockDisplay =
  | { state: "in-stock"; label: string; tone: "success" }
  | { state: "greying"; label: string; tone: "caution" }
  | { state: "hidden"; label: string; tone: "info" }
  | { state: "out-of-stock"; label: string; tone: "danger" };

const HOUR = 60 * 60 * 1000;

export function computeStockDisplay(
  rows: StoreStockRow[],
  globalStock: number,
  now: Date = new Date(),
): StockDisplay {
  const withStock = rows.filter((r) => r.count > 0);
  if (withStock.length === 0 && globalStock <= 0) {
    return { state: "out-of-stock", label: "Out of stock", tone: "danger" };
  }

  const fresh = withStock.filter(
    (r) => now.getTime() - r.updatedAt.getTime() < 12 * HOUR,
  );
  if (fresh.length > 0) {
    const storeNames = fresh.slice(0, 3).map((r) => r.storeName);
    return {
      state: "in-stock",
      label: `On the floor at ${storeNames.join(", ")}`,
      tone: "success",
    };
  }

  const greying = withStock.filter(
    (r) => now.getTime() - r.updatedAt.getTime() < 48 * HOUR,
  );
  if (greying.length > 0) {
    return {
      state: "greying",
      label: `Was at ${greying.length} store${greying.length > 1 ? "s" : ""} nearby — call to confirm`,
      tone: "caution",
    };
  }

  if (globalStock > 0) {
    return {
      state: "hidden",
      label: "Available to order — ships from our network",
      tone: "info",
    };
  }

  return { state: "out-of-stock", label: "Out of stock", tone: "danger" };
}
