import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PrivacyActions } from "@/components/account/PrivacyActions";

export default async function PrivacyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const consents = await db.consentRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const pendingRequests = await db.auditLog.findMany({
    where: {
      userId: user.id,
      action: { in: ["data_export_requested", "data_deletion_requested"] },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-body text-[16px] font-bold text-ink">
          Privacy &amp; data
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          What we hold, what you've consented to, and your DPDP rights.
        </p>
      </div>

      <div>
        <h2 className="text-[13px] font-semibold text-ink-muted">
          Consent record
        </h2>
        {consents.length === 0 ? (
          <p className="mt-1 text-[13px] text-ink-muted">
            No consent choices recorded yet.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {consents.map((c) => (
              <li key={c.id} className="text-[13px] text-ink">
                {c.kind.replaceAll("_", " ")} — {c.granted ? "granted" : "declined"} on{" "}
                {c.createdAt.toLocaleDateString("en-IN")}
              </li>
            ))}
          </ul>
        )}
      </div>

      <PrivacyActions />

      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-[13px] font-semibold text-ink-muted">
            Your requests
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {pendingRequests.map((r) => (
              <li key={r.id} className="text-[13px] text-ink">
                {r.action.replaceAll("_", " ")} — submitted{" "}
                {r.createdAt.toLocaleDateString("en-IN")}, handled within 90 days
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
