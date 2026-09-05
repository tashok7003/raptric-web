import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { ClaimForm } from "@/components/claims/ClaimForm";
import { WARRANTY } from "@/lib/siteConfig";

// 3d — coverage answered before the form: the warranty ladder is shown
// up front so "am I covered?" doesn't wait for a submission to find out.
export default async function NewClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ bikeId?: string }>;
}) {
  const { bikeId } = await searchParams;
  const user = await getCurrentUser();
  if (!bikeId) notFound();

  const bike = await db.ownedBike.findFirst({
    where: { id: bikeId, userId: user!.id },
    include: { model: true },
  });
  if (!bike) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-body text-[18px] font-bold text-ink">
        Raise a claim — {bike.model.name}
      </h1>
      <div className="mt-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 text-[13px]">
        <span className="font-semibold text-ink-muted">Your coverage</span>
        <ul className="mt-1 flex flex-col gap-0.5">
          {WARRANTY.ladder.map((l) => {
            const until =
              l.part === "Frame"
                ? bike.frameWarrantyUntil
                : l.part === "Motor"
                  ? bike.motorWarrantyUntil
                  : bike.batteryWarrantyUntil;
            const covered = until > new Date();
            return (
              <li key={l.part} className={covered ? "text-success" : "text-danger"}>
                {l.part}: {covered ? "covered" : "expired"} until{" "}
                {until.toLocaleDateString("en-IN")}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-ink-muted">
          Claim pickup fee: ₹{WARRANTY.claimPickupFee} if approved.
        </p>
      </div>
      <ClaimForm bikeId={bike.id} />
    </div>
  );
}
