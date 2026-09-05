"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setStoreStockAction } from "@/lib/actions/ops";

export function StockEditor({
  storeId,
  modelId,
  modelName,
  count,
  updatedAt,
}: {
  storeId: string;
  modelId: string;
  modelName: string;
  count: number;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(count);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 rounded-[6px] border border-[var(--color-border)] px-3 py-2">
      <span className="flex-1 text-[13px] text-ink">{modelName}</span>
      {updatedAt && (
        <span className="text-[11px] text-ink-muted">
          updated {new Date(updatedAt).toLocaleString("en-IN")}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-16 rounded-[4px] border border-[var(--color-border)] px-2 py-1 text-[13px]"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await setStoreStockAction(storeId, modelId, value);
            router.refresh();
          })
        }
        className="text-[12px] font-semibold text-action hover:underline disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}
