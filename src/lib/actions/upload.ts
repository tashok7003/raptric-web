"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/session";

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MARKETING_EDITOR" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_BYTES = 5 * 1024 * 1024;

// Local-filesystem storage under public/uploads — the CMS's image fields
// only ever accepted a pasted URL, constrained by next.config.ts's
// remotePatterns allowlist for anything going through next/image (i.e.
// every product photo). This is a real, working upload path for this
// app's actual deployment (a locally-run dev server with a persistent
// filesystem) — it would need swapping for real object storage (S3,
// Vercel Blob, etc.) on a serverless host where the filesystem is
// ephemeral/read-only, which this codebase doesn't have configured today.
export async function uploadImageAction(formData: FormData): Promise<{ url: string }> {
  await requireEditor();

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 5MB");

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/uploads/${filename}` };
}
