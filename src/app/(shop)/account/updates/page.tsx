import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/account/EmptyState";

// Notification centre (11c) — 3f's notify-me, 3c's status pushes and
// 6b's review invites all collect here instead of being fire-and-forget
// SMS only. The nav stays locked at 5 items (2a) — the unread signal is
// a dot on Account, not a sixth nav slot or a bell icon.
export default async function UpdatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No updates yet"
        detail="Order, ride and warranty updates will collect here as well as by SMS."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {notifications.map((n) => (
        <li
          key={n.id}
          className="flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-3"
        >
          {!n.readAt && (
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-action" />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-ink">
              {n.templateKey.replaceAll("_", " ")}
            </span>
            <span className="text-[12px] text-ink-muted">
              {n.createdAt.toLocaleString("en-IN")}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
