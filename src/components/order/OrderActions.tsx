"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import {
  advanceOrderStatusAction,
  activateWarrantyAction,
  cancelOrderAction,
} from "@/lib/actions/order";
import { CANCELLATION_FEE } from "@/lib/siteConfig";

interface OrderActionsProps {
  orderId: string;
  status: string;
  hasNextStatus: boolean;
  warrantyActivated: boolean;
}

// Sandbox order-progress controls, standing in for the courier
// webhook/ops action that doesn't exist yet (no AWB integration — 12d),
// plus the two real rider actions: activate warranty on delivery, and
// cancel before it ships (3e). RAPTRIC's real policy is defects-only
// after delivery — no buyer's-remorse return window — so a delivered
// order's only path back is the Claims flow, not a return button here.
export function OrderActions({
  orderId,
  status,
  hasNextStatus,
  warrantyActivated,
}: OrderActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cancelResult, setCancelResult] = useState<{ feeCharged: number } | null>(null);

  return (
    <div className="mt-6 flex flex-col gap-3">
      {hasNextStatus && (
        <StatusCard
          tone="info"
          label="Sandbox mode — no courier integration connected yet"
          title="Advance this order to the next status"
          detail="A real deployment updates this from the courier's webhook instead."
          action={
            <Button
              variant="secondary"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  await advanceOrderStatusAction(orderId);
                  router.refresh();
                })
              }
            >
              Advance status
            </Button>
          }
        />
      )}

      {status === "DELIVERED" && !warrantyActivated && (
        <StatusCard
          tone="success"
          label="Delivered"
          title="Activate your warranty"
          detail="Takes 2 minutes and puts your frame number on record."
          action={
            <Button
              variant="primary"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  await activateWarrantyAction(orderId);
                  router.refresh();
                })
              }
            >
              Activate warranty
            </Button>
          }
        />
      )}

      {(status === "PAID" || status === "ASSEMBLED") && (
        <Button
          variant="secondary"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await cancelOrderAction(orderId);
              setCancelResult(res);
              router.refresh();
            })
          }
        >
          Cancel order (₹{CANCELLATION_FEE} fee)
        </Button>
      )}

      {cancelResult && (
        <StatusCard
          tone={cancelResult.feeCharged > 0 ? "caution" : "success"}
          label="Request received"
          title={
            cancelResult.feeCharged > 0
              ? `₹${cancelResult.feeCharged} cancellation fee applies`
              : "No fee — refund on the way"
          }
        />
      )}
    </div>
  );
}
