import { getCart } from "@/lib/cart";
import { redirect } from "next/navigation";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { isEmiEligible } from "@/lib/emi";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const subtotal = cart.items.reduce((sum, i) => sum + i.model.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <CheckoutFlow subtotal={subtotal} emiEligible={isEmiEligible(subtotal)} />
    </div>
  );
}
