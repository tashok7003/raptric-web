/**
 * Payment/EMI provider interfaces. Real merchant credentials
 * (RAZORPAY_KEY_ID/SECRET, BAJAJ_*) don't exist yet — see
 * PaymentIntegrationsREADME.md at the repo root. Until they're supplied
 * via env vars, `getPaymentProvider()`/`getEmiProvider()` fall back to
 * deterministic mock implementations so the checkout/EMI flow is fully
 * exercisable end to end. Swapping in real credentials requires no
 * changes to any calling code — only the provider behind these
 * interfaces changes.
 */

export interface CreatePaymentOrderResult {
  providerOrderId: string;
  amount: number;
}

export interface PaymentProvider {
  name: string;
  createOrder(orderNo: string, amountInPaise: number): Promise<CreatePaymentOrderResult>;
  verifyPayment(input: {
    providerOrderId: string;
    providerPaymentId: string;
    signature: string;
  }): Promise<boolean>;
}

export type EmiDecision =
  | { status: "APPROVED"; bajajRefId: string }
  | { status: "DECLINED"; reason: string }
  | { status: "PENDING"; bajajRefId: string };

export interface EmiProvider {
  name: string;
  applyForEmi(input: {
    orderNo: string;
    amount: number;
    tenureMonths: number;
    phone: string;
  }): Promise<EmiDecision>;
}
