"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { saveProductAction, type ProductFormInput } from "@/lib/actions/cms";
import type { ProductKind } from "@/generated/prisma/enums";

interface ProductFormProps {
  id?: string;
  initial?: Partial<ProductFormInput>;
}

const KINDS: ProductKind[] = ["EBIKE", "MBIKE", "ACCESSORY", "BATTERY"];

export function ProductForm({ id, initial }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormInput>({
    slug: initial?.slug ?? "",
    kind: initial?.kind ?? "EBIKE",
    name: initial?.name ?? "",
    mrp: initial?.mrp ?? 0,
    price: initial?.price ?? 0,
    emiTenureMonths: initial?.emiTenureMonths ?? 24,
    rangeKm: initial?.rangeKm,
    gears: initial?.gears,
    wheelSize: initial?.wheelSize,
    bestSeller: initial?.bestSeller ?? false,
    isNew: initial?.isNew ?? false,
    globalStock: initial?.globalStock ?? 0,
  });
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <div className="flex gap-2">
        {KINDS.map((k) => (
          <button key={k} type="button" onClick={() => setForm({ ...form, kind: k })}>
            <Chip variant={form.kind === k ? "selected" : "default"}>{k}</Chip>
          </button>
        ))}
      </div>
      <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Field
        label="Slug"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        hint="Used in the URL — lowercase, hyphenated"
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="MRP"
          type="number"
          value={form.mrp}
          onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
        />
        <Field
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
      </div>
      {form.kind === "EBIKE" && (
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Range (km)"
            type="number"
            value={form.rangeKm ?? ""}
            onChange={(e) => setForm({ ...form, rangeKm: Number(e.target.value) })}
          />
          <Field
            label="EMI tenure (months)"
            type="number"
            value={form.emiTenureMonths}
            onChange={(e) => setForm({ ...form, emiTenureMonths: Number(e.target.value) })}
          />
        </div>
      )}
      {form.kind === "MBIKE" && (
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Gears"
            type="number"
            value={form.gears ?? ""}
            onChange={(e) => setForm({ ...form, gears: Number(e.target.value) })}
          />
          <Field
            label="Wheel size"
            value={form.wheelSize ?? ""}
            onChange={(e) => setForm({ ...form, wheelSize: e.target.value })}
          />
        </div>
      )}
      <Field
        label="Stock (network)"
        type="number"
        value={form.globalStock}
        onChange={(e) => setForm({ ...form, globalStock: Number(e.target.value) })}
      />
      <div className="flex gap-2">
        <button type="button" onClick={() => setForm({ ...form, bestSeller: !form.bestSeller })}>
          <Chip variant={form.bestSeller ? "selected" : "default"}>Best seller</Chip>
        </button>
        <button type="button" onClick={() => setForm({ ...form, isNew: !form.isNew })}>
          <Chip variant={form.isNew ? "selected" : "default"}>New</Chip>
        </button>
      </div>
      <Button
        variant="primary"
        loading={pending}
        loadingLabel="Saving…"
        disabled={!form.name || !form.slug}
        onClick={() => startTransition(() => saveProductAction(id ?? null, form))}
      >
        Save (draft)
      </Button>
    </div>
  );
}
