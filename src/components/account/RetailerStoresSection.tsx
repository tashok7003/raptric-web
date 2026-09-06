"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RetailerStoreForm } from "@/components/account/RetailerStoreForm";

interface StoreData {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  hours: string;
}

export function RetailerStoresSection({ stores }: { stores: StoreData[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {stores.length === 0 && !addingNew && (
        <p className="text-[13px] text-ink-muted">No stores set up yet.</p>
      )}

      {stores.map((s) =>
        editingId === s.id ? (
          <RetailerStoreForm
            key={s.id}
            storeId={s.id}
            initial={s}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-3"
          >
            <div className="text-[13px]">
              <p className="font-semibold text-ink">{s.name}</p>
              <p className="text-ink-muted">
                {s.address}, {s.city} {s.pincode} · {s.phone}
              </p>
            </div>
            <Button variant="ghost" onClick={() => setEditingId(s.id)}>
              Edit
            </Button>
          </div>
        ),
      )}

      {addingNew ? (
        <RetailerStoreForm onDone={() => setAddingNew(false)} />
      ) : (
        <Button variant="secondary" className="self-start" onClick={() => setAddingNew(true)}>
          + Add your store
        </Button>
      )}
    </div>
  );
}
