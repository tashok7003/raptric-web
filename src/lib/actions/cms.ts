"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductKind } from "@/generated/prisma/enums";

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MARKETING_EDITOR" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
  return user;
}

export interface ProductFormInput {
  slug: string;
  kind: ProductKind;
  name: string;
  mrp: number;
  price: number;
  emiTenureMonths: number;
  rangeKm?: number;
  gears?: number;
  wheelSize?: string;
  bestSeller: boolean;
  isNew: boolean;
  globalStock: number;
  heroImage?: string;
  gallery?: string[];
  specs?: Record<string, string>;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// 1o/4h — the CMS product editor with a stock toggle (globalStock),
// draft/live status. Publish is a status flip, not a separate diff/
// dead-link-preflight pipeline yet — that's the honest gap against
// 4h's full spec (partial publish, revert) until it's asked for.
export async function saveProductAction(id: string | null, input: ProductFormInput) {
  await requireEditor();

  const { gallery, specs, ...rest } = input;
  const emiMonthly = input.price >= 20000 ? Math.round(input.price / input.emiTenureMonths) : null;
  const data = {
    ...rest,
    emiMonthly,
    gallery: JSON.stringify(gallery ?? []),
    specsJson: JSON.stringify(specs ?? {}),
  };

  if (id) {
    await db.productModel.update({ where: { id }, data });
  } else {
    await db.productModel.create({ data: { ...data, status: "DRAFT" } });
  }

  revalidatePath("/cms/products");
  redirect("/cms/products");
}

export async function setProductStatusAction(id: string, status: "DRAFT" | "LIVE" | "ARCHIVED") {
  await requireEditor();
  await db.productModel.update({
    where: { id },
    data: { status, publishedAt: status === "LIVE" ? new Date() : undefined },
  });
  revalidatePath("/cms/products");
}
