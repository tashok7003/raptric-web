import { EMI } from "./siteConfig";

/**
 * One EMI number (12d) — every card's "from ₹", the PDP, the compare tool
 * and the explainer's calculator all read from this. No-cost EMI: the
 * monthly figure is simply price / tenure, no interest added.
 */
export function calcEmiMonthly(price: number, tenureMonths: number) {
  return Math.round(price / tenureMonths);
}

export function emiTenureOptions(price: number) {
  return EMI.tenuresMonths.map((tenure) => ({
    tenure,
    monthly: calcEmiMonthly(price, tenure),
  }));
}

/** mBikes/accessories under ₹20,000 don't carry EMI (10a/10e note). */
export function isEmiEligible(price: number) {
  return price >= 20000;
}
