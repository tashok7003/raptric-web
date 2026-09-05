import { db } from "@/lib/db";
import { RetailerPipelineRow } from "@/components/ops/RetailerPipelineRow";

export const dynamic = "force-dynamic";

// 7a — the BD pipeline behind the public application form.
export default async function RetailerPipelinePage() {
  const retailers = await db.retailer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">
        Retailer / BD pipeline
      </h1>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
              <th className="py-2">Store</th>
              <th className="py-2">Owner</th>
              <th className="py-2">Territory</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {retailers.map((r) => (
              <RetailerPipelineRow
                key={r.id}
                id={r.id}
                name={r.name}
                ownerName={r.ownerName}
                territoryPin={r.territoryPin}
                status={r.status}
              />
            ))}
            {retailers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-muted">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
