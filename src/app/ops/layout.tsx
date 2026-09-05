import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { InternalHeader } from "@/components/chrome/InternalHeader";

export const dynamic = "force-dynamic";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OPS_LEAD" && user.role !== "ADMIN")) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-surface">
      <InternalHeader
        tool="Ops"
        role={user.role}
        links={[
          { href: "/ops/orders", label: "Orders" },
          { href: "/ops/stock", label: "Stock" },
          { href: "/ops/serviceability", label: "Serviceability" },
          { href: "/ops/retailers", label: "Retailers" },
        ]}
      />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
