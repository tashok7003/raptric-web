import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { InternalLayout } from "@/components/chrome/InternalLayout";

export const dynamic = "force-dynamic";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OPS_LEAD" && user.role !== "ADMIN")) {
    redirect("/sign-in");
  }

  return (
    <InternalLayout
      tool="Ops"
      role={user.role}
      links={[
        { href: "/ops/orders", label: "Orders" },
        { href: "/ops/stock", label: "Stock" },
        { href: "/ops/serviceability", label: "Serviceability" },
        { href: "/ops/retailers", label: "Retailers" },
      ]}
    >
      {children}
    </InternalLayout>
  );
}
