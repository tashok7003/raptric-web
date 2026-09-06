import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { WARRANTY } from "@/lib/siteConfig";

export default async function YourBikePage() {
  const user = await getCurrentUser();
  // AccountLayout already redirects when signed out, but it reads the
  // session in a separate query — if a session is revoked between that
  // check and this one (e.g. sign-out firing mid-navigation), this page
  // must not crash on the resulting null.
  if (!user) redirect("/sign-in");

  const bikes = await db.ownedBike.findMany({
    where: { userId: user.id },
    include: { model: true },
    orderBy: { purchaseDate: "desc" },
  });

  if (bikes.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center">
        <h1 className="font-body text-[16px] font-bold text-ink">No bike yet</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Your test rides and saved bikes are here. The rest appears when
          you buy.
        </p>
        <Link
          href="/bikes"
          className="mt-4 inline-block rounded-[var(--radius-control)] bg-action px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          See the models
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bikes.map((bike) => (
        <div
          key={bike.id}
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-4"
        >
          <div className="flex items-center gap-3">
            <div className="size-14 shrink-0 rounded-[6px] bg-surface-sunk" />
            <div className="flex flex-col gap-0.5">
              <span className="font-body text-[15px] font-bold text-ink">
                {bike.model.name}
              </span>
              <span className="text-[12px] text-ink-muted">
                Frame {bike.frameNumber} · yours since{" "}
                {bike.purchaseDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-[12px] text-action">
                Frame covered to{" "}
                {bike.frameWarrantyUntil.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Link
              href="/test-ride"
              className="rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-center text-[13px] font-semibold text-ink hover:bg-surface-sunk"
            >
              Book a service
            </Link>
            <Link
              href={`/account/claims/new?bikeId=${bike.id}`}
              className="rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-center text-[13px] font-semibold text-ink hover:bg-surface-sunk"
            >
              Raise a claim
            </Link>
            <Link
              href="/accessories"
              className="rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-center text-[13px] font-semibold text-ink hover:bg-surface-sunk"
            >
              Buy a part
            </Link>
            <Link
              href="/account/documents"
              className="rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-center text-[13px] font-semibold text-ink hover:bg-surface-sunk"
            >
              Download invoice
            </Link>
          </div>

          <p className="mt-3 text-[11px] text-ink-muted">
            {WARRANTY.ladder.map((l) => `${l.part} ${l.months} mo`).join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}
