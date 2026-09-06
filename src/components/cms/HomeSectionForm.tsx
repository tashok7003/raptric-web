"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { updateHomeSectionAction } from "@/lib/actions/homeSections";
import { ImageUploadField } from "@/components/cms/ImageUploadField";
import type { HomeSectionType, ProductGridConfig } from "@/lib/homeSections";

interface FormValues {
  heading: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  config: Record<string, unknown>;
}

interface HomeSectionFormProps {
  id: string;
  type: HomeSectionType;
  initial: FormValues;
}

/** Same isNextRedirectError guard as ProductForm — kept local since this
 * action doesn't redirect today, but a generic catch-and-report handler
 * here would otherwise misreport a future redirect as a failed save. */
function isNextRedirectError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function HomeSectionForm({ id, type, initial }: HomeSectionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(initial);
  const [statItems, setStatItems] = useState<string[]>(
    Array.isArray((initial.config as { items?: unknown }).items)
      ? ((initial.config as { items: string[] }).items ?? [])
      : [],
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const gridConfig = form.config as Partial<ProductGridConfig>;

  function save(config: Record<string, unknown>) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateHomeSectionAction(id, { ...form, config });
        setSaved(true);
        router.refresh();
      } catch (err) {
        if (isNextRedirectError(err)) throw err;
        setError("Couldn't save this section. Try again.");
      }
    });
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      {error && <StatusCard tone="danger" label="Couldn't save" title={error} />}
      {saved && !error && <StatusCard tone="success" label="Saved" title="Section updated" />}

      {(type === "HERO" || type === "PRODUCT_GRID" || type === "PROMO") && (
        <Field label="Heading" value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} />
      )}

      {(type === "HERO" || type === "PROMO") && (
        <Field label="Body text" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      )}

      {(type === "HERO" || type === "PROMO") && (
        <>
          <Field
            label="Image URL"
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            hint="Any public image URL works — the homepage renders this one unoptimized, unlike product photos"
          />
          <ImageUploadField onUploaded={(url) => setForm({ ...form, imageUrl: url })} />
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS-entered URL
            <img
              src={form.imageUrl}
              alt=""
              className="h-32 w-full rounded-[6px] border border-[var(--color-border)] object-cover"
            />
          )}
        </>
      )}

      {(type === "HERO" || type === "PRODUCT_GRID" || type === "PROMO") && (
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={type === "HERO" ? "Primary button label" : "Link label"}
            value={form.ctaLabel}
            onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
          />
          <Field
            label={type === "HERO" ? "Primary button link" : "Link href"}
            value={form.ctaHref}
            onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
            placeholder="/bikes"
          />
        </div>
      )}

      {type === "HERO" && (
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Secondary link label"
            value={(form.config as { secondaryCtaLabel?: string }).secondaryCtaLabel ?? ""}
            onChange={(e) => setForm({ ...form, config: { ...form.config, secondaryCtaLabel: e.target.value } })}
          />
          <Field
            label="Secondary link href"
            value={(form.config as { secondaryCtaHref?: string }).secondaryCtaHref ?? ""}
            onChange={(e) => setForm({ ...form, config: { ...form.config, secondaryCtaHref: e.target.value } })}
            placeholder="/emi"
          />
        </div>
      )}

      {type === "PRODUCT_GRID" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-body text-label uppercase text-ink-muted">
              Which products
            </label>
            <select
              value={gridConfig.kind ?? "ALL"}
              onChange={(e) => setForm({ ...form, config: { ...form.config, kind: e.target.value } })}
              className="rounded-[6px] border border-[var(--color-border)] bg-surface-raised px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
            >
              <option value="ALL">eBikes & mBikes</option>
              <option value="EBIKE">eBikes only</option>
              <option value="MBIKE">mBikes only</option>
            </select>
          </div>
          <Field
            label="Max shown"
            type="number"
            value={gridConfig.limit ?? 8}
            onChange={(e) => setForm({ ...form, config: { ...form.config, limit: Number(e.target.value) } })}
          />
        </div>
      )}

      {type === "STAT_BAR" && (
        <div className="flex flex-col gap-2">
          <span className="font-body text-label uppercase text-ink-muted">
            Stats (2-4 shown)
          </span>
          {statItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                aria-label={`Stat ${i + 1}`}
                value={item}
                onChange={(e) => {
                  const items = [...statItems];
                  items[i] = e.target.value;
                  setStatItems(items);
                }}
                className="flex-1 rounded-[6px] border border-[var(--color-border)] bg-surface-raised px-3 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
              />
              <Button type="button" variant="ghost" onClick={() => setStatItems(statItems.filter((_, j) => j !== i))}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="ghost" className="self-start" onClick={() => setStatItems([...statItems, ""])}>
            + Add stat
          </Button>
        </div>
      )}

      <Button
        variant="primary"
        loading={pending}
        loadingLabel="Saving…"
        onClick={() => {
          if (type === "STAT_BAR") {
            save({ items: statItems.filter((s) => s.trim()) });
          } else {
            save(form.config);
          }
        }}
      >
        Save
      </Button>
    </div>
  );
}
