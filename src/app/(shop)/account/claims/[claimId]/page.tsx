import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { StatusCard } from "@/components/ui/StatusCard";
import { ClaimDecisionSandbox } from "@/components/claims/ClaimDecisionSandbox";
import { WARRANTY } from "@/lib/siteConfig";

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  const { claimId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const isStaff = user.role === "SUPPORT_AGENT" || user.role === "ADMIN";
  const claim = await db.claim.findFirst({
    where: isStaff ? { id: claimId } : { id: claimId, userId: user.id },
    include: { bike: { include: { model: true } } },
  });
  if (!claim) notFound();

  return (
    <div className="mx-auto max-w-lg flex flex-col gap-4">
      <h1 className="font-body text-[18px] font-bold text-ink">
        Claim {claim.claimNo}
      </h1>
      <p className="text-[13px] text-ink-muted">
        {claim.bike.model.name} · {claim.component} · {claim.description}
      </p>

      {claim.status === "RECEIVED" && (
        <StatusCard
          tone="info"
          label="Claim logged"
          title="We'll have a decision within 3 working days"
          detail={`Due by ${claim.slaDueAt?.toLocaleDateString("en-IN")}`}
        />
      )}

      {claim.status === "APPROVED" && (
        <StatusCard
          tone="success"
          label="Claim approved"
          title="Pickup scheduled"
          detail={`₹${WARRANTY.claimPickupFee} payable to the rider on pickup.`}
        />
      )}

      {claim.status === "DECLINED" && (
        <StatusCard
          tone="danger"
          label="Claim declined"
          title={claim.declineReason ?? "This isn't covered under warranty"}
          detail="If you disagree, our support team can take another look."
          action={
            <Link
              href="/support/contact"
              className="mt-1 inline-block text-[13px] font-semibold text-action hover:underline"
            >
              Talk to support →
            </Link>
          }
        />
      )}

      {claim.status === "RECEIVED" && isStaff && <ClaimDecisionSandbox claimId={claim.id} />}
    </div>
  );
}
