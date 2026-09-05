import Link from "next/link";
import { db } from "@/lib/db";
import { JournalStatusToggle } from "@/components/cms/JournalStatusToggle";

export default async function CmsJournalPage() {
  const posts = await db.journalPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-body text-[18px] font-bold text-ink">Journal</h1>
        <Link
          href="/cms/journal/new"
          className="rounded-[var(--radius-control)] bg-action px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          New post
        </Link>
      </div>
      <table className="mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-ink-muted">
            <th className="py-2">Title</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-b border-[var(--color-border)]">
              <td className="py-2 font-medium text-ink">{p.title}</td>
              <td className="py-2">
                <JournalStatusToggle id={p.id} status={p.status} />
              </td>
              <td className="py-2 text-right">
                <Link href={`/cms/journal/${p.id}`} className="text-action hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
