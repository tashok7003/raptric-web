"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { saveProductAction, type ProductFormInput } from "@/lib/actions/cms";
import { ImageUploadField } from "@/components/cms/ImageUploadField";
import type { ProductKind } from "@/generated/prisma/enums";

/** `redirect()` inside a server action throws this to signal Next.js's own
 * client runtime to navigate — a generic catch here must let it through
 * rather than reporting the (successful) save as a failure. */
function isNextRedirectError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

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
    heroImage: initial?.heroImage ?? "",
    gallery: initial?.gallery ?? [],
    description: initial?.description ?? "",
    metaTitle: initial?.metaTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
  });
  // Kept as rows rather than directly as the Record<string,string> the
  // action expects — editing a key in-place on an object means juggling
  // rename-vs-overwrite-on-collision; rows sidestep that, and get
  // collapsed into an object only at submit time.
  const [specRows, setSpecRows] = useState<{ key: string; value: string }[]>(
    Object.entries(initial?.specs ?? {}).map(([key, value]) => ({ key, value })),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex max-w-lg flex-col gap-4">
      {error && <StatusCard tone="danger" label="Couldn't save" title={error} />}
      <div className="flex gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={form.kind === k}
            onClick={() => setForm({ ...form, kind: k })}
            className="inline-flex min-h-11 items-center"
          >
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
      <div className="flex flex-col gap-1">
        <label className="font-body text-label uppercase text-ink-muted">
          Description
        </label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="rounded-[6px] border border-[var(--color-border)] bg-surface-raised px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
        />
        <span className="text-[13px] text-ink-muted">Shown on the product page, below the price.</span>
      </div>
      <Field
        label="Hero image URL"
        type="url"
        value={form.heroImage ?? ""}
        onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
        hint="Paste a URL from an allowed host (currently images.unsplash.com) — see next.config.ts — or upload a file below"
      />
      <ImageUploadField onUploaded={(url) => setForm({ ...form, heroImage: url })} />
      {form.heroImage && (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS-entered URL, not a known-good remote pattern for next/image
        <img
          src={form.heroImage}
          alt=""
          className="h-32 w-32 rounded-[6px] border border-[var(--color-border)] object-cover"
        />
      )}

      <div className="flex flex-col gap-2">
        <span className="font-body text-label uppercase text-ink-muted">
          Gallery images
        </span>
        {(form.gallery ?? []).map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="url"
              aria-label={`Gallery image ${i + 1} URL`}
              value={url}
              onChange={(e) => {
                const gallery = [...(form.gallery ?? [])];
                gallery[i] = e.target.value;
                setForm({ ...form, gallery });
              }}
              className="flex-1 rounded-[6px] border border-[var(--color-border)] bg-surface-raised px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
            />
            {url && (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS-entered URL
              <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-[6px] border border-[var(--color-border)] object-cover" />
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm({ ...form, gallery: (form.gallery ?? []).filter((_, j) => j !== i) })}
            >
              Remove
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setForm({ ...form, gallery: [...(form.gallery ?? []), ""] })}
          >
            + Add image URL
          </Button>
          <ImageUploadField
            label="+ Upload image"
            onUploaded={(url) => setForm({ ...form, gallery: [...(form.gallery ?? []), url] })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-body text-label uppercase text-ink-muted">
          Specs
        </span>
        {specRows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              placeholder="Key (e.g. Motor)"
              aria-label={`Spec ${i + 1} key`}
              value={row.key}
              onChange={(e) => {
                const rows = [...specRows];
                rows[i] = { ...rows[i], key: e.target.value };
                setSpecRows(rows);
              }}
              className="w-2/5 rounded-[6px] border border-[var(--color-border)] bg-surface-raised px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
            />
            <input
              placeholder="Value (e.g. 250W BLDC hub)"
              aria-label={`Spec ${i + 1} value`}
              value={row.value}
              onChange={(e) => {
                const rows = [...specRows];
                rows[i] = { ...rows[i], value: e.target.value };
                setSpecRows(rows);
              }}
              className="flex-1 rounded-[6px] border border-[var(--color-border)] bg-surface-raised px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
            />
            <Button type="button" variant="ghost" onClick={() => setSpecRows(specRows.filter((_, j) => j !== i))}>
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          className="self-start"
          onClick={() => setSpecRows([...specRows, { key: "", value: "" }])}
        >
          + Add spec
        </Button>
      </div>
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

      <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
        <span className="font-body text-label uppercase text-ink-muted">
          SEO
        </span>
        <Field
          label="Page title"
          value={form.metaTitle ?? ""}
          onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
          hint={`Defaults to "${form.name || "Product name"} — RAPTRIC" if left blank`}
        />
        <Field
          label="Page description"
          value={form.metaDescription ?? ""}
          onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
          hint="Shown in search results and link previews"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={form.bestSeller}
          onClick={() => setForm({ ...form, bestSeller: !form.bestSeller })}
          className="inline-flex min-h-11 items-center"
        >
          <Chip variant={form.bestSeller ? "selected" : "default"}>Best seller</Chip>
        </button>
        <button
          type="button"
          aria-pressed={form.isNew}
          onClick={() => setForm({ ...form, isNew: !form.isNew })}
          className="inline-flex min-h-11 items-center"
        >
          <Chip variant={form.isNew ? "selected" : "default"}>New</Chip>
        </button>
      </div>
      <Button
        variant="primary"
        loading={pending}
        loadingLabel="Saving…"
        disabled={!form.name || !form.slug}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const specs = Object.fromEntries(
                specRows.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]),
              );
              const gallery = (form.gallery ?? []).filter((url) => url.trim());
              await saveProductAction(id ?? null, { ...form, gallery, specs });
            } catch (err) {
              if (isNextRedirectError(err)) throw err;
              setError("Couldn't save this product. Check the fields and try again.");
            }
          });
        }}
      >
        Save (draft)
      </Button>
    </div>
  );
}
