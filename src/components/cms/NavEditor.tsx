"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { StatusCard } from "@/components/ui/StatusCard";
import {
  addNavItemAction,
  removeNavItemAction,
  updateNavItemAction,
  moveNavItemAction,
} from "@/lib/actions/nav";

interface NavItemData {
  id: string;
  label: string;
  href: string;
  hasDropdown: boolean;
}

function EditRow({ item, onDone }: { item: NavItemData; onDone: () => void }) {
  const router = useRouter();
  const [label, setLabel] = useState(item.label);
  const [href, setHref] = useState(item.href);
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-3">
      <Field label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Field label="Href" value={href} onChange={(e) => setHref(e.target.value)} />
      <div className="flex gap-2">
        <Button
          variant="primary"
          loading={pending}
          disabled={!label || !href}
          onClick={() =>
            startTransition(async () => {
              await updateNavItemAction(item.id, label, href);
              router.refresh();
              onDone();
            })
          }
        >
          Save
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </li>
  );
}

export function NavEditor({ items }: { items: NavItemData[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [pending, startTransition] = useTransition();
  const [capError, setCapError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

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
        {items.map((item, i) =>
          editingId === item.id ? (
            <EditRow key={item.id} item={item} onDone={() => setEditingId(null)} />
          ) : (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised px-3 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={pending || i === 0}
                  aria-label="Move up"
                  onClick={() => run(() => moveNavItemAction(item.id, "up"))}
                  className="grid size-6 place-items-center rounded-[4px] text-ink-muted hover:bg-surface-sunk disabled:opacity-30"
                >
                  <ArrowUp className="size-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={pending || i === items.length - 1}
                  aria-label="Move down"
                  onClick={() => run(() => moveNavItemAction(item.id, "down"))}
                  className="grid size-6 place-items-center rounded-[4px] text-ink-muted hover:bg-surface-sunk disabled:opacity-30"
                >
                  <ArrowDown className="size-3.5" aria-hidden />
                </button>
              </div>
              <span className="flex-1 text-[13px] font-medium text-ink">
                {item.label} <span className="text-ink-muted">{item.href}</span>
              </span>
              {item.hasDropdown && (
                <Chip variant="badge" className="shrink-0">
                  Has submenu
                </Chip>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => setEditingId(item.id)}
                className="rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-[13px] font-semibold text-ink hover:bg-surface-sunk"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => removeNavItemAction(item.id))}
                aria-label="Remove"
                className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface-sunk"
              >
                <X className="size-4 text-ink-muted" aria-hidden />
              </button>
            </li>
          ),
        )}
      </ul>

      {items.some((i) => i.hasDropdown) && (
        <p className="text-[13px] text-ink-muted">
          Items marked <Chip variant="badge">Has submenu</Chip> show a dropdown (Shop / Support) —
          renaming one of those away from its exact default label drops its submenu.
        </p>
      )}

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
