"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { saveJournalPostAction, type JournalFormInput } from "@/lib/actions/journal";

export function JournalForm({
  id,
  initial,
  productOptions,
}: {
  id?: string;
  initial?: Partial<JournalFormInput>;
  productOptions: { id: string; name: string }[];
}) {
  const [form, setForm] = useState<JournalFormInput>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    body: initial?.body ?? "",
    productCalloutModelId: initial?.productCalloutModelId,
  });
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Field label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      <Field
        label="Excerpt"
        value={form.excerpt}
        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
      />
      <div className="flex flex-col gap-1">
        <label className="font-body text-label uppercase text-ink-muted">
          Body
        </label>
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={8}
          className="rounded-[6px] border border-[var(--color-border)] px-3 py-2.5 text-[15px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-body text-label uppercase text-ink-muted">
          Product callout
        </label>
        <select
          value={form.productCalloutModelId ?? ""}
          onChange={(e) => setForm({ ...form, productCalloutModelId: e.target.value || undefined })}
          className="rounded-[6px] border border-[var(--color-border)] px-3 py-2.5 text-[15px]"
        >
          <option value="">None</option>
          {productOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        variant="primary"
        loading={pending}
        loadingLabel="Saving…"
        disabled={!form.title || !form.slug}
        onClick={() => startTransition(() => saveJournalPostAction(id ?? null, form))}
      >
        Save (draft)
      </Button>
    </div>
  );
}
