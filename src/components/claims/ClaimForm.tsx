"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { submitClaimAction } from "@/lib/actions/claims";

export function ClaimForm({ bikeId }: { bikeId: string }) {
  const router = useRouter();
  const [component, setComponent] = useState<"frame" | "motor" | "battery">("frame");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {error && <StatusCard tone="danger" label="Couldn't submit" title={error} />}
      <div className="flex gap-2">
        {(["frame", "motor", "battery"] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={component === c}
            onClick={() => setComponent(c)}
            className="inline-flex min-h-11 items-center"
          >
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
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await submitClaimAction({ bikeId, component, description });
              router.push(`/account/claims/${res.claimId}`);
            } catch {
              setError("Couldn't submit your claim. Please try again.");
            }
          });
        }}
      >
        Submit claim
      </Button>
    </div>
  );
}
