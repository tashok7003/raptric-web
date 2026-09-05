"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { setServiceabilityAction } from "@/lib/actions/ops";

interface Row {
  pincode: string;
  serviceable: boolean;
  freeDelivery: boolean;
}

export function ServiceabilityEditor({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pincode, setPincode] = useState("");
  const [serviceable, setServiceable] = useState(true);
  const [freeDelivery, setFreeDelivery] = useState(true);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4 flex max-w-md flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <li
            key={r.pincode}
            className="flex items-center justify-between rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-[13px]"
          >
            <span className="font-medium text-ink">{r.pincode}</span>
            <span className="text-ink-muted">
              {r.serviceable ? "Serviceable" : "Not serviceable"} ·{" "}
              {r.freeDelivery ? "Free delivery" : "₹900 fee"}
            </span>
          </li>
        ))}
      </ul>

      <Field label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setServiceable(!serviceable)}>
          <Chip variant={serviceable ? "selected" : "default"}>Serviceable</Chip>
        </button>
        <button type="button" onClick={() => setFreeDelivery(!freeDelivery)}>
          <Chip variant={freeDelivery ? "selected" : "default"}>Free delivery</Chip>
        </button>
      </div>
      <Button
        variant="secondary"
        loading={pending}
        disabled={!pincode}
        onClick={() =>
          startTransition(async () => {
            await setServiceabilityAction(pincode, serviceable, freeDelivery);
            setPincode("");
            router.refresh();
          })
        }
      >
        Save
      </Button>
    </div>
  );
}
