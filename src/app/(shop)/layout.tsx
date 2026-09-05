import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { cartItemCount } from "@/lib/cart";
import { getCurrentUser } from "@/lib/session";
import { getNavItems } from "@/lib/nav";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, user, navItems] = await Promise.all([
    cartItemCount(),
    getCurrentUser(),
    getNavItems(),
  ]);
  return (
    <>
      <SiteHeader cartCount={count} signedIn={!!user} navItems={navItems} />
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
