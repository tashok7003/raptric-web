import type { EmiProvider, PaymentProvider } from "./types";

/**
 * Deterministic mock providers, used whenever real credentials are
 * absent. `createOrder` returns an id prefixed `mock_` so the checkout
 * UI knows to render the simulate-outcome controls instead of a real
 * payment widget — see CheckoutPaymentStep.tsx.
 */
export function makeMockPaymentProvider(): PaymentProvider {
  return {
    name: "mock",
    async createOrder(orderNo, amountInPaise) {
      return { providerOrderId: `mock_${orderNo}_${Date.now()}`, amount: amountInPaise };
    },
    async verifyPayment() {
      return true;
    },
  };
}

export function makeMockEmiProvider(): EmiProvider {
  return {
    name: "mock",
    async applyForEmi({ orderNo, phone }) {
      // Deterministic-ish rule so the three EMI journey states (9a/9b)
      // are all reachable in testing: last digit of phone decides it.
      const lastDigit = Number(phone.replace(/\D/g, "").slice(-1)) || 0;
      if (lastDigit % 5 === 0) {
        return { status: "DECLINED", reason: "Insufficient bureau history" };
      }
      if (lastDigit % 3 === 0) {
        return { status: "PENDING", bajajRefId: `mock-bajaj-${orderNo}` };
      }
      return { status: "APPROVED", bajajRefId: `mock-bajaj-${orderNo}` };
    },
  };
}
