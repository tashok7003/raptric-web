"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { requestDataAction } from "@/lib/actions/privacy";

export function PrivacyActions() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<"export" | "delete" | null>(null);

  function submit(kind: "export" | "delete") {
    startTransition(async () => {
      await requestDataAction(kind);
      setDone(kind);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {done && (
        <StatusCard
          tone="success"
          label="Request received"
          title={
            done === "export"
              ? "We'll email your data within 90 days"
              : "We'll delete your account within 90 days"
          }
          detail="Self-serve export and deletion are being built — this is handled by a person for now."
        />
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => submit("export")} loading={pending}>
          Download my data
        </Button>
        <Button variant="secondary" onClick={() => submit("delete")} loading={pending}>
          Delete my account
        </Button>
      </div>
    </div>
  );
}
