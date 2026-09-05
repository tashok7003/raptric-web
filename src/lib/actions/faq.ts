"use server";

import { db } from "@/lib/db";

// 4g — the FAQ editor's zero-result backlog is its work queue; logging
// starts here, on the public search box.
export async function logFaqSearchAction(query: string, resultCount: number) {
  if (!query.trim()) return;
  await db.faqSearchLog.create({ data: { query, resultCount } });
}
