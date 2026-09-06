import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Chip } from "@/components/ui/Chip";
import { StatusCard } from "@/components/ui/StatusCard";
import { RetailerOrderRow } from "@/components/account/RetailerOrderRow";
import { RetailerStoresSection } from "@/components/account/RetailerStoresSection";

export const dynamic = "force-dynamic";

// Self-service view for a RETAILER-role login — distinct from
// /ops/retailers, which is the staff-facing BD pipeline for *managing*
// every partner. This is what one partner sees of their own account.
export default async function RetailerDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RETAILER") redirect("/account");

  if (!user.retailerId) {
    return (
      <StatusCard
        tone="caution"
        label="Not linked yet"
        title="Your account isn't linked to a retailer record"
        detail="Contact RAPTRIC support to get your retailer partnership connected to this login."
      />
    );
  }

  const retailer = await db.retailer.findUnique({
    where: { id: user.retailerId },
    include: { stores: true },
  });
  if (!retailer) redirect("/account");

  const wholesaleOrders = await db.wholesaleOrder.findMany({
    where: { retailerId: retailer.id },
    include: { model: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-body text-[18px] font-bold text-ink">{retailer.name}</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Owner: {retailer.ownerName} · Territory {retailer.territoryPin}
        </p>
        <Chip variant={retailer.status === "LIVE" ? "selected" : "default"} className="mt-2">
          {retailer.status}
        </Chip>
      </div>

      <div>
        <h2 className="font-body text-[15px] font-semibold text-ink">Your stores</h2>
        <div className="mt-2">
          <RetailerStoresSection
            stores={retailer.stores.map((s) => ({
              id: s.id,
              name: s.name,
              address: s.address,
              city: s.city,
              pincode: s.pincode,
              phone: s.phone,
              hours: Object.values(JSON.parse(s.hoursJson || "{}"))[0] as string | undefined ?? "",
            }))}
          />
        </div>
      </div>

      <div>
        <h2 className="font-body text-[15px] font-semibold text-ink">Wholesale orders</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
                <th className="py-2">Model</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Terms</th>
                <th className="py-2">Status</th>
                <th className="py-2">Placed</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wholesaleOrders.map((o) => (
                <RetailerOrderRow
                  key={o.id}
                  id={o.id}
                  modelName={o.model.name}
                  quantity={o.quantity}
                  consignment={o.consignment}
                  status={o.status}
                  createdAt={o.createdAt.toLocaleDateString("en-IN")}
                />
              ))}
              {wholesaleOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-muted">
                    No wholesale orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
