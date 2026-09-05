import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Journal index (1m) — 11i showed this is the organic front door, not
// depth content; promoted into Phase 1 by 12c.
export default async function JournalIndexPage() {
  const posts = await db.journalPost.findMany({
    where: { status: "LIVE" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-[22px] font-bold text-ink">Journal</h1>
      <p className="mt-1 text-[14px] text-ink-muted">
        Buying guides and rider stories — not a spec sheet.
      </p>

      {posts.length === 0 ? (
        <p className="mt-8 text-[13px] text-ink-muted">
          Nothing published yet.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/journal/${post.slug}`}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 hover:border-ink"
            >
              <span className="font-body text-[17px] font-semibold text-ink">
                {post.title}
              </span>
              {post.excerpt && (
                <p className="mt-1 text-[13px] text-ink-muted">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
