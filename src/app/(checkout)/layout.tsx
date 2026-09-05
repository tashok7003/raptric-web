import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";

// 2a's deliberate exception: cart/checkout/confirmation keep the
// stripped logo-only chrome — no nav to wander off through mid-payment.
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader variant="checkout" />
      <main id="main-content" className="flex-1 bg-surface">{children}</main>
      <SiteFooter variant="checkout" />
    </>
  );
}
