import "server-only";
import Razorpay from "razorpay";
import { createHmac } from "crypto";
import type { PaymentProvider } from "./types";

export function makeRazorpayProvider(): PaymentProvider {
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  return {
    name: "razorpay",
    async createOrder(orderNo, amountInPaise) {
      const order = await instance.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderNo,
      });
      return { providerOrderId: order.id, amount: amountInPaise };
    },
    async verifyPayment({ providerOrderId, providerPaymentId, signature }) {
      const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest("hex");
      return expected === signature;
    },
  };
}
