import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { InternalLayout } from "@/components/chrome/InternalLayout";

export const dynamic = "force-dynamic";

// 7b's permission principle: money out and money owed need a second
// pair of eyes; everything else is reversible. Publishing a product is
// reversible (draft/live), so MARKETING_EDITOR and ADMIN both get in.
export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MARKETING_EDITOR" && user.role !== "ADMIN")) {
    redirect("/sign-in");
  }

  return (
    <InternalLayout
      tool="CMS"
      role={user.role}
      links={[
        { href: "/cms/products", label: "Products" },
        { href: "/cms/journal", label: "Journal" },
        { href: "/cms/nav", label: "Navigation" },
        { href: "/cms/home", label: "Homepage" },
      ]}
    >
      {children}
    </InternalLayout>
  );
}
