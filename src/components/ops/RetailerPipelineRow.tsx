"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRetailerStatusAction } from "@/lib/actions/retailer";
import { Button } from "@/components/ui/Button";

const NEXT: Record<string, "TERRITORY_CHECKED" | "DOCS" | "APPROVED" | "LIVE"> = {
  APPLIED: "TERRITORY_CHECKED",
  TERRITORY_CHECKED: "DOCS",
  DOCS: "APPROVED",
  APPROVED: "LIVE",
};

export function RetailerPipelineRow({
  id,
  name,
  ownerName,
  territoryPin,
  status,
}: {
  id: string;
  name: string;
  ownerName: string;
  territoryPin: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = NEXT[status];

  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="py-2 font-medium text-ink">{name}</td>
      <td className="py-2 text-ink-muted">{ownerName}</td>
      <td className="py-2 text-ink-muted">{territoryPin}</td>
      <td className="py-2 text-ink-muted">{status.replaceAll("_", " ")}</td>
      <td className="py-2 text-right">
        <div className="flex justify-end gap-2">
          {next && (
            <Button
              variant="ghost"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  await setRetailerStatusAction(id, next);
                  router.refresh();
                })
              }
            >
              Advance
            </Button>
          )}
          {status !== "REJECTED" && status !== "LIVE" && (
            <Button
              variant="ghost"
              loading={pending}
              className="text-danger hover:text-danger"
              onClick={() => {
                if (!window.confirm(`Reject ${name}'s retailer application? This can't be undone from here.`)) {
                  return;
                }
                startTransition(async () => {
                  await setRetailerStatusAction(id, "REJECTED");
                  router.refresh();
                });
              }}
            >
              Reject
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
