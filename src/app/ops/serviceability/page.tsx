import { db } from "@/lib/db";
import { ServiceabilityEditor } from "@/components/ops/ServiceabilityEditor";

export const dynamic = "force-dynamic";

// 5b — pincode serviceability, feeding 2f's delivery-fee check and 3f's
// coverage-request demand map.
export default async function ServiceabilityPage() {
  const rows = await db.serviceability.findMany({ orderBy: { pincode: "asc" } });

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">Serviceability</h1>
      <ServiceabilityEditor
        rows={rows.map((r) => ({
          pincode: r.pincode,
          serviceable: r.serviceable,
          freeDelivery: r.freeDelivery,
        }))}
      />
    </div>
  );
}
