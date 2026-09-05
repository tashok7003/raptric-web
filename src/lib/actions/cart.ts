"use server";

import { revalidatePath } from "next/cache";
import * as cart from "@/lib/cart";
import { trackEvent } from "@/lib/actions/analytics";

export async function addToCartAction(modelId: string, quantity = 1) {
  await cart.addItem(modelId, quantity);
  await trackEvent("add_to_cart", { modelId, quantity });
  revalidatePath("/cart");
  return cart.cartItemCount();
}

export async function removeFromCartAction(itemId: string) {
  await cart.removeItem(itemId);
  revalidatePath("/cart");
}

export async function setQuantityAction(itemId: string, quantity: number) {
  await cart.setQuantity(itemId, quantity);
  revalidatePath("/cart");
}
