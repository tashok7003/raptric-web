"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { reorderWholesaleOrderAction } from "@/lib/actions/retailer";

interface RetailerOrderRowProps {
  id: string;
  modelName: string;
  quantity: number;
  consignment: boolean;
  status: string;
  createdAt: string;
}

export function RetailerOrderRow({ id, modelName, quantity, consignment, status, createdAt }: RetailerOrderRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="py-2">{modelName}</td>
      <td className="py-2">{quantity}</td>
      <td className="py-2">{consignment ? "Consignment" : "Outright"}</td>
      <td className="py-2">{status}</td>
      <td className="py-2">{createdAt}</td>
      <td className="py-2">
        <div className="flex gap-2">
          {status === "DELIVERED" && (
            <Link href={`/account/retailer/orders/${id}/record`} className="text-[13px] font-semibold text-action hover:underline">
              View record
            </Link>
          )}
          <Button
            variant="ghost"
            loading={pending}
            loadingLabel="Reordering…"
            onClick={() =>
              startTransition(async () => {
                await reorderWholesaleOrderAction(id);
                router.refresh();
              })
            }
          >
            Reorder
          </Button>
        </div>
      </td>
    </tr>
  );
}
