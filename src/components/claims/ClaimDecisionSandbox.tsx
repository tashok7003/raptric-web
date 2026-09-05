"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusCard } from "@/components/ui/StatusCard";
import { Button } from "@/components/ui/Button";
import { decideClaimAction } from "@/lib/actions/claims";

// No support-agent console yet (task 13) to drive real decisions —
// same sandbox convention as payments/order status/OTP.
export function ClaimDecisionSandbox({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <StatusCard
      tone="info"
      label="Sandbox mode — no support console connected yet"
      title="Simulate a decision"
      action={
        <div className="mt-1 flex gap-2">
          <Button
            variant="primary"
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                await decideClaimAction(claimId, "APPROVED");
                router.refresh();
              })
            }
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                await decideClaimAction(claimId, "DECLINED", "Wear and tear, not a manufacturing defect");
                router.refresh();
              })
            }
          >
            Decline
          </Button>
        </div>
      }
    />
  );
}
