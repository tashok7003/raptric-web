"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { addNavItemAction, removeNavItemAction } from "@/lib/actions/nav";

export function NavEditor({ items }: { items: { id: string; label: string; href: string }[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [pending, startTransition] = useTransition();
  const [capError, setCapError] = useState(false);

  return (
    <div className="flex max-w-md flex-col gap-4">
      {capError && (
        <StatusCard
          tone="caution"
          label="5-item cap"
          title="Nav is full"
          detail="Remove an item before adding another — the cap is enforced here, not just suggested."
        />
      )}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-3 py-2"
          >
            <span className="text-[13px] font-medium text-ink">
              {item.label} <span className="text-ink-muted">{item.href}</span>
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await removeNavItemAction(item.id);
                  router.refresh();
                })
              }
              aria-label="Remove"
            >
              <X className="size-4 text-ink-muted" />
            </button>
          </li>
        ))}
      </ul>

      <Field label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Field label="Href" value={href} onChange={(e) => setHref(e.target.value)} placeholder="/why-raptric" />
      <Button
        variant="secondary"
        loading={pending}
        disabled={items.length >= 5 || !label || !href}
        onClick={() =>
          startTransition(async () => {
            const res = await addNavItemAction(label, href);
            if (!res.ok) setCapError(true);
            else {
              setLabel("");
              setHref("");
              router.refresh();
            }
          })
        }
      >
        Add item ({items.length}/5)
      </Button>
    </div>
  );
}
