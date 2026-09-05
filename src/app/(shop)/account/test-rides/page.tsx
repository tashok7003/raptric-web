import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/account/EmptyState";

export default async function TestRidesPage() {
  const user = await getCurrentUser();
  const rides = await db.testRide.findMany({
    where: { userId: user!.id },
    include: { model: true, store: true },
    orderBy: { slot: "desc" },
  });

  if (rides.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          title="No test rides booked"
          detail="A 15-minute ride tells you more than any spec sheet."
        />
        <Link
          href="/test-ride"
          className="self-center rounded-[var(--radius-control)] bg-action px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          Book a test ride
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rides.map((ride) => (
        <div
          key={ride.id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[14px] font-semibold text-ink">
              {ride.model.name} · {ride.store.name}
            </span>
            <span className="text-[12px] text-ink-muted">
              {ride.slot.toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
            {ride.status}
          </span>
        </div>
      ))}
    </div>
  );
}
