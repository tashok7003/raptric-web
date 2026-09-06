import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { InternalLayout } from "@/components/chrome/InternalLayout";

export const dynamic = "force-dynamic";

export default async function SupportConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT_AGENT" && user.role !== "ADMIN")) {
    redirect("/sign-in");
  }

  return (
    <InternalLayout
      tool="Support"
      role={user.role}
      links={[
        { href: "/support-console", label: "Customer search" },
        { href: "/support-console/payments", label: "Failed payments" },
        { href: "/support-console/claims", label: "Claims queue" },
      ]}
    >
      {children}
    </InternalLayout>
  );
}
