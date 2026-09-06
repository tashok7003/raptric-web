"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { saveRetailerStoreAction, type RetailerStoreInput } from "@/lib/actions/retailer";

interface RetailerStoreFormProps {
  storeId?: string;
  initial?: Partial<RetailerStoreInput>;
  onDone?: () => void;
}

export function RetailerStoreForm({ storeId, initial, onDone }: RetailerStoreFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<RetailerStoreInput>({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    pincode: initial?.pincode ?? "",
    phone: initial?.phone ?? "",
    hours: initial?.hours ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-4">
      {error && <StatusCard tone="danger" label="Couldn't save" title={error} />}
      <Field label="Store name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Field label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <Field label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Field
          label="Hours"
          value={form.hours}
          onChange={(e) => setForm({ ...form, hours: e.target.value })}
          placeholder="Mon-Sun 10:00-20:00"
        />
      </div>
      <Button
        variant="primary"
        loading={pending}
        loadingLabel="Saving…"
        disabled={!form.name || !form.address || !form.city || !form.pincode || !form.phone}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await saveRetailerStoreAction(storeId ?? null, form);
              router.refresh();
              onDone?.();
            } catch {
              setError("Couldn't save this store. Check the fields and try again.");
            }
          });
        }}
      >
        Save store
      </Button>
    </div>
  );
}
