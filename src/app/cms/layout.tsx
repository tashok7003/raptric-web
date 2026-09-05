import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { InternalHeader } from "@/components/chrome/InternalHeader";

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
    <div className="min-h-screen bg-surface">
      <InternalHeader
        tool="CMS"
        role={user.role}
        links={[
          { href: "/cms/products", label: "Products" },
          { href: "/cms/journal", label: "Journal" },
          { href: "/cms/nav", label: "Navigation" },
        ]}
      />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
