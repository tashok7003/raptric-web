"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { addToCartAction } from "@/lib/actions/cart";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  modelId,
  outOfStock,
  className,
}: {
  modelId: string;
  outOfStock?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  if (outOfStock) {
    return (
      <Button variant="secondary" className={className}>
        Notify me
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      className={className}
      loading={pending}
      loadingLabel="Adding…"
      pulse={added}
      onClick={() =>
        startTransition(async () => {
          await addToCartAction(modelId);
          setAdded(true);
          // router.refresh() re-renders this button's own server-rendered
          // parent, which was replacing this component's instance (and
          // its `added` state) before the confirmation ever got a chance
          // to paint — the button silently went straight back to "Add to
          // cart" with no visible feedback that anything happened.
          // Deferring the refresh until after the confirmation's shown
          // its full duration avoids the button being replaced out from
          // under itself.
          setTimeout(() => {
            setAdded(false);
            router.refresh();
          }, 1500);
        })
      }
    >
      {added ? (
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-4" aria-hidden /> Added
        </span>
      ) : (
        "Add to cart"
      )}
    </Button>
  );
}
