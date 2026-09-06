import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/session";
import { getNavItems } from "@/lib/nav";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, user, navItems] = await Promise.all([
    getCart(),
    getCurrentUser(),
    getNavItems(),
  ]);
  const cartItems = (cart?.items ?? []).map((i) => ({
    id: i.id,
    name: i.model.name,
    image: i.model.heroImage,
    price: i.model.price,
    quantity: i.quantity,
  }));
  return (
    <>
      <SiteHeader cartItems={cartItems} signedIn={!!user} navItems={navItems} />
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter role={user?.role} />
    </>
  );
}
