import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/account/EmptyState";

// 8a — serviceability per address, amber when one falls out of service.
export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const addresses = await db.address.findMany({ where: { userId: user.id } });

  if (addresses.length === 0) {
    return (
      <EmptyState
        title="No saved addresses"
        detail="Addresses you use at checkout are saved here automatically."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-4"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[14px] font-semibold text-ink">
              {addr.label}
            </span>
            <span className="text-[12px] text-ink-muted">
              {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
            </span>
          </div>
          {!addr.serviceable && (
            <span className="rounded-[999px] bg-caution-bg px-2 py-0.5 text-[11px] font-semibold text-caution">
              Out of service area
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
