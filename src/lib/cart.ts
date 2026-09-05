import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";
import { CART_MAX_QTY } from "./siteConfig";

const GUEST_COOKIE = "raptric_guest_cart";

/**
 * Guest-cart identity via an httpOnly cookie. Once sign-in (step 7,
 * OTP) is wired, addToCart resolves the signed-in user's cart instead
 * and this guest cart can be merged into it — the checkout guest-vs-
 * account choice (2f/12d) reads off the same distinction.
 */
async function getOrCreateGuestKey() {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (existing) return existing;
  const key = randomUUID();
  store.set(GUEST_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return key;
}

export async function getOrCreateCart() {
  const guestKey = await getOrCreateGuestKey();
  const cart = await db.cart.upsert({
    where: { guestKey },
    update: {},
    create: { guestKey },
    include: { items: { include: { model: true } } },
  });
  return cart;
}

export async function getCart() {
  const store = await cookies();
  const guestKey = store.get(GUEST_COOKIE)?.value;
  if (!guestKey) return null;
  return db.cart.findUnique({
    where: { guestKey },
    include: { items: { include: { model: true } } },
  });
}

export async function addItem(modelId: string, quantity = 1) {
  const cart = await getOrCreateCart();
  const existing = cart.items.find((i) => i.modelId === modelId);
  const nextQty = Math.min(
    (existing?.quantity ?? 0) + quantity,
    CART_MAX_QTY,
  );

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        modelId,
        quantity: nextQty,
        reservedUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
  }

  // 7-day hold on the cart itself (9c)
  await db.cart.update({
    where: { id: cart.id },
    data: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
}

export async function removeItem(itemId: string) {
  await db.cartItem.delete({ where: { id: itemId } });
}

export async function setQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await removeItem(itemId);
    return;
  }
  await db.cartItem.update({
    where: { id: itemId },
    data: { quantity: Math.min(quantity, CART_MAX_QTY) },
  });
}

export async function cartItemCount() {
  const cart = await getCart();
  return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
}
