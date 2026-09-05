"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { submitClaimAction } from "@/lib/actions/claims";

export function ClaimForm({ bikeId }: { bikeId: string }) {
  const router = useRouter();
  const [component, setComponent] = useState<"frame" | "motor" | "battery">("frame");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex gap-2">
        {(["frame", "motor", "battery"] as const).map((c) => (
          <button key={c} type="button" onClick={() => setComponent(c)}>
            <Chip variant={component === c ? "selected" : "default"}>{c}</Chip>
          </button>
        ))}
      </div>
      <Field
        label="What's wrong"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue"
      />
      <Button
        variant="primary"
        loading={pending}
        loadingLabel="Submitting…"
        disabled={!description}
        onClick={() =>
          startTransition(async () => {
            const res = await submitClaimAction({ bikeId, component, description });
            router.push(`/account/claims/${res.claimId}`);
          })
        }
      >
        Submit claim
      </Button>
    </div>
  );
}
