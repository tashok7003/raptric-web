"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { defaultsFor, type HomeSectionType } from "@/lib/homeSections";

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MARKETING_EDITOR" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
}

function refresh() {
  revalidatePath("/cms/home");
  revalidatePath("/");
}

export async function addHomeSectionAction(type: HomeSectionType) {
  await requireEditor();
  const count = await db.homeSection.count();
  const d = defaultsFor(type);
  await db.homeSection.create({
    data: {
      type,
      order: count,
      heading: d.heading,
      body: d.body,
      ctaLabel: d.ctaLabel,
      ctaHref: d.ctaHref,
      configJson: JSON.stringify(d.config),
    },
  });
  refresh();
}

export async function removeHomeSectionAction(id: string) {
  await requireEditor();
  await db.homeSection.delete({ where: { id } });
  refresh();
}

export interface HomeSectionFormInput {
  heading?: string;
  body?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  config: Record<string, unknown>;
}

export async function updateHomeSectionAction(id: string, input: HomeSectionFormInput) {
  await requireEditor();
  await db.homeSection.update({
    where: { id },
    data: {
      heading: input.heading || null,
      body: input.body || null,
      imageUrl: input.imageUrl || null,
      ctaLabel: input.ctaLabel || null,
      ctaHref: input.ctaHref || null,
      configJson: JSON.stringify(input.config),
    },
  });
  refresh();
}

export async function setHomeSectionStatusAction(id: string, status: "DRAFT" | "LIVE") {
  await requireEditor();
  await db.homeSection.update({ where: { id }, data: { status } });
  refresh();
}

// Swaps this section's `order` with its neighbour in the given direction —
// simple adjacent-swap reordering rather than drag-and-drop, matching how
// the rest of the CMS (nav, products) favours plain buttons over richer
// interaction patterns.
export async function moveHomeSectionAction(id: string, direction: "up" | "down") {
  await requireEditor();
  const sections = await db.homeSection.findMany({ orderBy: { order: "asc" } });
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= sections.length) return;

  const a = sections[index];
  const b = sections[swapWith];
  await db.$transaction([
    db.homeSection.update({ where: { id: a.id }, data: { order: b.order } }),
    db.homeSection.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  refresh();
}
