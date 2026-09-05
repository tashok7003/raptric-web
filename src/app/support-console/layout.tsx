import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { InternalHeader } from "@/components/chrome/InternalHeader";

export const dynamic = "force-dynamic";

export default async function SupportConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT_AGENT" && user.role !== "ADMIN")) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-surface">
      <InternalHeader
        tool="Support"
        role={user.role}
        links={[
          { href: "/support-console", label: "Customer search" },
          { href: "/support-console/payments", label: "Failed payments" },
          { href: "/support-console/claims", label: "Claims queue" },
        ]}
      />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
