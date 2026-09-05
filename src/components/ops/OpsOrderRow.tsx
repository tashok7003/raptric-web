"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { advanceOrderStatusAction } from "@/lib/actions/order";
import { NEXT_ORDER_STATUS } from "@/lib/orderStatus";
import { Button } from "@/components/ui/Button";

const TERMINAL = new Set(["DELIVERED", "CANCELLED", "RETURNED"]);
const LATE_DAYS = 6;

export function OpsOrderRow({
  orderId,
  orderNo,
  rider,
  items,
  status,
  createdAt,
}: {
  orderId: string;
  orderNo: string;
  rider: string;
  items: string;
  status: string;
  createdAt: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Date.now() can't be read during render — it'd differ between the
  // server's render and the client's first render, tripping a hydration
  // mismatch on the "late" badge. Deferring to an effect keeps them in
  // sync; the badge simply isn't shown until a moment after mount.
  const [late, setLate] = useState(false);
  useEffect(() => {
    const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    setLate(!TERMINAL.has(status) && ageDays > LATE_DAYS);
  }, [createdAt, status]);

  const hasNext = !!NEXT_ORDER_STATUS[status];

  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="py-2 font-medium text-ink">{orderNo}</td>
      <td className="py-2 text-ink-muted">{rider}</td>
      <td className="py-2 text-ink-muted">{items}</td>
      <td className="py-2">
        <span
          className={cn(
            "rounded-[999px] px-2 py-0.5 text-[11px] font-semibold uppercase",
            late ? "bg-danger-bg text-danger" : "bg-info-bg text-action",
          )}
        >
          {status.replaceAll("_", " ")}
          {late && " · late"}
        </span>
      </td>
      <td className="py-2 text-right">
        {hasNext && (
          <Button
            variant="ghost"
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                await advanceOrderStatusAction(orderId);
                router.refresh();
              })
            }
          >
            Advance
          </Button>
        )}
      </td>
    </tr>
  );
}
