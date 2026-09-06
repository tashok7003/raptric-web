"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import {
  addHomeSectionAction,
  removeHomeSectionAction,
  moveHomeSectionAction,
  setHomeSectionStatusAction,
} from "@/lib/actions/homeSections";
import { HOME_SECTION_TYPES, type HomeSectionType } from "@/lib/homeSections";

interface Section {
  id: string;
  type: HomeSectionType;
  status: "DRAFT" | "LIVE";
  heading: string | null;
}

const TYPE_LABELS: Record<HomeSectionType, string> = Object.fromEntries(
  HOME_SECTION_TYPES.map((t) => [t.value, t.label]),
) as Record<HomeSectionType, string>;

export function HomeSectionList({ sections }: { sections: Section[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newType, setNewType] = useState<HomeSectionType>(HOME_SECTION_TYPES[0].value);

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {sections.map((s, i) => (
          <li
            key={s.id}
            className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-3"
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                disabled={pending || i === 0}
                aria-label="Move up"
                onClick={() => run(() => moveHomeSectionAction(s.id, "up"))}
                className="grid size-6 place-items-center rounded-[4px] text-ink-muted hover:bg-surface-sunk disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                disabled={pending || i === sections.length - 1}
                aria-label="Move down"
                onClick={() => run(() => moveHomeSectionAction(s.id, "down"))}
                className="grid size-6 place-items-center rounded-[4px] text-ink-muted hover:bg-surface-sunk disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" aria-hidden />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <Chip variant="badge">{TYPE_LABELS[s.type]}</Chip>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(() => setHomeSectionStatusAction(s.id, s.status === "LIVE" ? "DRAFT" : "LIVE"))
                  }
                >
                  <Chip variant={s.status === "LIVE" ? "selected" : "default"}>{s.status}</Chip>
                </button>
              </div>
              <span className="text-[13px] font-medium text-ink">
                {s.heading || <span className="text-ink-muted">Untitled</span>}
              </span>
            </div>

            <Link
              href={`/cms/home/${s.id}`}
              className="rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-[13px] font-semibold text-ink hover:bg-surface-sunk"
            >
              Edit
            </Link>
            <button
              type="button"
              disabled={pending}
              aria-label="Remove section"
              onClick={() => {
                if (confirm(`Remove this ${TYPE_LABELS[s.type]} section?`)) {
                  run(() => removeHomeSectionAction(s.id));
                }
              }}
              className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface-sunk"
            >
              <Trash2 className="size-4 text-danger" aria-hidden />
            </button>
          </li>
        ))}
        {sections.length === 0 && (
          <li className="py-6 text-center text-[13px] text-ink-muted">No sections yet.</li>
        )}
      </ul>

      <div className="flex items-center gap-2">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as HomeSectionType)}
          className="rounded-[6px] border border-[var(--color-border)] bg-surface-raised px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
        >
          {HOME_SECTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          loading={pending}
          onClick={() => run(() => addHomeSectionAction(newType))}
        >
          + Add section
        </Button>
      </div>
      <p className="text-[13px] text-ink-muted">
        {HOME_SECTION_TYPES.find((t) => t.value === newType)?.description}
      </p>
    </div>
  );
}
