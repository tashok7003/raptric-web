import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AccountNav } from "@/components/account/AccountNav";

export const dynamic = "force-dynamic";

// Account (12b) — redrawn at its real size: a side list, not a tab bar,
// landing on "your bike" rather than "Orders" (this shop sells one thing
// you keep for five years).
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <AccountNav name={user.name} phone={user.phone} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
