"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MARKETING_EDITOR" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
}

export interface JournalFormInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  productCalloutModelId?: string;
}

// 4f — the journal block editor; product callout pulls live price/stock
// by storing a model id and reading it at render time, not a copied
// price.
export async function saveJournalPostAction(id: string | null, input: JournalFormInput) {
  await requireEditor();
  const data = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    bodyJson: JSON.stringify({ text: input.body }),
    productCalloutModelId: input.productCalloutModelId || null,
  };

  if (id) {
    await db.journalPost.update({ where: { id }, data });
  } else {
    await db.journalPost.create({ data: { ...data, status: "DRAFT" } });
  }

  revalidatePath("/cms/journal");
  redirect("/cms/journal");
}

export async function setJournalStatusAction(id: string, status: "DRAFT" | "LIVE") {
  await requireEditor();
  await db.journalPost.update({
    where: { id },
    data: { status, publishedAt: status === "LIVE" ? new Date() : undefined },
  });
  revalidatePath("/cms/journal");
  revalidatePath("/journal");
}
