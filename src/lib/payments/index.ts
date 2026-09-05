import "server-only";
import { makeMockEmiProvider, makeMockPaymentProvider } from "./mock";
import { makeRazorpayProvider } from "./razorpay";
import type { EmiProvider, PaymentProvider } from "./types";

let paymentProvider: PaymentProvider | undefined;
let emiProvider: EmiProvider | undefined;

export function getPaymentProvider(): PaymentProvider {
  if (paymentProvider) return paymentProvider;
  paymentProvider =
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
      ? makeRazorpayProvider()
      : makeMockPaymentProvider();
  return paymentProvider;
}

export function getEmiProvider(): EmiProvider {
  if (emiProvider) return emiProvider;
  // No real Bajaj sandbox access yet (12d's launch blocker list) — always
  // mock until BAJAJ_API_KEY is supplied.
  emiProvider = makeMockEmiProvider();
  return emiProvider;
}

export type { PaymentProvider, EmiProvider } from "./types";
