"use server";

import { db } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { cookies } from "next/headers";
import { getPaymentProvider, getEmiProvider } from "@/lib/payments";
import { calcEmiMonthly } from "@/lib/emi";
import { revalidatePath } from "next/cache";
import { trackEvent } from "@/lib/actions/analytics";

function generateOrderNo() {
  return `RP-${Date.now().toString(36).toUpperCase()}`;
}

export interface StartCheckoutInput {
  name: string;
  phone: string;
  email?: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
}

// 2f/12d — guest-vs-account choice: checkout creates or reuses a User by
// phone without requiring the OTP sign-in flow (step 7) first. Signing in
// later (same phone) surfaces this same order in the account hub.
export async function startCheckoutAction(input: StartCheckoutInput) {
  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const serviceability = await db.serviceability.findUnique({
    where: { pincode: input.pincode },
  });
  const deliveryFee = serviceability?.freeDelivery === false ? 900 : 0;
  if (serviceability && !serviceability.serviceable) {
    throw new Error("NOT_SERVICEABLE");
  }

  const user = await db.user.upsert({
    where: { phone: input.phone },
    update: { name: input.name, ...(input.email ? { email: input.email } : {}) },
    create: { phone: input.phone, name: input.name, email: input.email },
  });

  const address = await db.address.create({
    data: {
      userId: user.id,
      label: "Delivery",
      line1: input.addressLine,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
    },
  });

  const subtotal = cart.items.reduce(
    (sum, i) => sum + i.model.price * i.quantity,
    0,
  );

  const order = await db.order.create({
    data: {
      orderNo: generateOrderNo(),
      userId: user.id,
      addressId: address.id,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      guestCheckout: true,
      items: {
        create: cart.items.map((i) => ({
          modelId: i.modelId,
          quantity: i.quantity,
          price: i.model.price,
        })),
      },
    },
  });

  await trackEvent("checkout_started", { orderId: order.id, total: order.total });

  return { orderId: order.id, orderNo: order.orderNo, total: order.total, userPhone: user.phone };
}

export async function choosePaymentMethodAction(
  orderId: string,
  method: "UPI" | "CARD" | "EMI",
  tenureMonths?: number,
) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { user: true } });
  const provider = getPaymentProvider();
  const providerOrder = await provider.createOrder(order.orderNo, order.total * 100);

  await db.payment.upsert({
    where: { orderId },
    update: { method, razorpayOrderId: providerOrder.providerOrderId, status: "INITIATED" },
    create: {
      orderId,
      method,
      amount: order.total,
      razorpayOrderId: providerOrder.providerOrderId,
      status: "INITIATED",
    },
  });

  if (method === "EMI" && tenureMonths) {
    const emi = getEmiProvider();
    const decision = await emi.applyForEmi({
      orderNo: order.orderNo,
      amount: order.total,
      tenureMonths,
      phone: order.user.phone,
    });

    const emiApp = await db.emiApplication.upsert({
      where: { orderId },
      update: {
        tenureMonths,
        monthlyAmount: calcEmiMonthly(order.total, tenureMonths),
        status: decision.status,
        declineReason: decision.status === "DECLINED" ? decision.reason : undefined,
        bajajRefId: decision.status !== "DECLINED" ? decision.bajajRefId : undefined,
      },
      create: {
        orderId,
        tenureMonths,
        monthlyAmount: calcEmiMonthly(order.total, tenureMonths),
        status: decision.status,
        declineReason: decision.status === "DECLINED" ? decision.reason : undefined,
        bajajRefId: decision.status !== "DECLINED" ? decision.bajajRefId : undefined,
      },
    });
    await trackEvent(decision.status === "DECLINED" ? "emi_declined" : "emi_approved", {
      orderId,
      tenureMonths,
    });
    return { providerName: provider.name, emi: emiApp };
  }

  return { providerName: provider.name, emi: null };
}

export type SimulatedOutcome = "success" | "failed" | "upi_pending";

export async function simulatePaymentOutcomeAction(
  orderId: string,
  outcome: SimulatedOutcome,
) {
  if (outcome === "success") {
    await db.payment.update({
      where: { orderId },
      data: { status: "SUCCESS", razorpayPaymentId: `mock_pay_${Date.now()}` },
    });
    await db.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
    await db.invoice.upsert({
      where: { orderId },
      update: {},
      create: { orderId, invoiceNo: `INV-${order.orderNo}` },
    });

    const cookieStore = await cookies();
    const guestKey = cookieStore.get("raptric_guest_cart")?.value;
    if (guestKey) {
      const cart = await db.cart.findUnique({ where: { guestKey } });
      if (cart) await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    await trackEvent("order_placed", { orderId, total: order.total });
  } else if (outcome === "failed") {
    await trackEvent("payment_failed", { orderId });
    await db.payment.update({
      where: { orderId },
      data: {
        status: "FAILED",
        failureReason: "Bank declined the transaction",
        cartHeldUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  } else {
    await db.payment.update({ where: { orderId }, data: { status: "PENDING" } });
  }

  revalidatePath("/checkout");
  return outcome;
}
