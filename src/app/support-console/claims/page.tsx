import Link from "next/link";
import { db } from "@/lib/db";
import { cn } from "@/lib/cn";

// 5a — claims with SLA countdowns; a decline requires typed reasoning
// that goes verbatim to the customer in 3d (declineReason is the exact
// string the rider sees on their claim page).
export default async function ClaimsQueuePage() {
  const claims = await db.claim.findMany({
    where: { status: "RECEIVED" },
    include: { user: true, bike: { include: { model: true } } },
    orderBy: { slaDueAt: "asc" },
  });
  const now = new Date();

  return (
    <div>
      <h1 className="font-body text-[18px] font-bold text-ink">
        Claims queue · {claims.length}
      </h1>
      <table className="mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Claim</th>
            <th className="py-2">Rider</th>
            <th className="py-2">Bike</th>
            <th className="py-2">Component</th>
            <th className="py-2">SLA due</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => {
            const overdue = c.slaDueAt && c.slaDueAt < now;
            return (
              <tr key={c.id} className="border-b border-[var(--color-border)]">
                <td className="py-2 font-medium">
                  <Link href={`/account/claims/${c.id}`} className="text-action hover:underline">
                    {c.claimNo}
                  </Link>
                </td>
                <td className="py-2 text-ink-muted">{c.user.name ?? c.user.phone}</td>
                <td className="py-2 text-ink-muted">{c.bike.model.name}</td>
                <td className="py-2 text-ink-muted">{c.component}</td>
                <td className={cn("py-2", overdue ? "text-danger" : "text-caution")}>
                  {c.slaDueAt?.toLocaleDateString("en-IN")}
                </td>
              </tr>
            );
          })}
          {claims.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-ink-muted">
                Nothing in the queue.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
