"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRetailerStatusAction } from "@/lib/actions/retailer";

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
        <div className="flex justify-end gap-3">
          {next && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setRetailerStatusAction(id, next);
                  router.refresh();
                })
              }
              className="text-action hover:underline disabled:opacity-50"
            >
              Advance
            </button>
          )}
          {status !== "REJECTED" && status !== "LIVE" && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setRetailerStatusAction(id, "REJECTED");
                  router.refresh();
                })
              }
              className="text-danger hover:underline disabled:opacity-50"
            >
              Reject
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
