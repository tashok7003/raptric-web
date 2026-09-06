"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Heart, Scale } from "lucide-react";
import { cn } from "@/lib/cn";
import { PriceBlock } from "./PriceBlock";
import { Chip } from "./Chip";
import { Button } from "./Button";
import { springHover, useReducedMotion } from "@/lib/motion";
import { addToCartAction } from "@/lib/actions/cart";
import { toggleCompare, getCompareIds } from "@/lib/compareTray";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  kind: "EBIKE" | "MBIKE" | "ACCESSORY" | "BATTERY";
  image?: string | null;
  bestSeller?: boolean;
  isNew?: boolean;
  price: number;
  mrp?: number;
  emiMonthly?: number | null;
  emiTenureMonths?: number;
  rangeKm?: number | null;
  gears?: number | null;
  wheelSize?: string | null;
  outOfStock?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  onNotifyMe?: () => void;
}

// 10e — the eBike card leads with EMI, the mBike with price; accessory
// gets a Quick view secondary action instead of Add. One component, a
// variant driven by `kind`, so 4b's reasoning lives in code once.
export function ProductCard({ product, onNotifyMe }: ProductCardProps) {
  const reduceMotion = useReducedMotion();
  const isEbike = product.kind === "EBIKE";
  const isAccessory = product.kind === "ACCESSORY" || product.kind === "BATTERY";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const [inCompare, setInCompare] = useState(false);

  function handleAdd() {
    startTransition(async () => {
      await addToCartAction(product.id);
      setJustAdded(true);
      // Deferred for the same reason as AddToCartButton/AddToCartBar: an
      // immediate router.refresh() re-rendered this card from its parent
      // and reset justAdded before the confirmation ever painted, so the
      // button silently reverted to "Add to cart" with no feedback.
      setTimeout(() => {
        setJustAdded(false);
        router.refresh();
      }, 1500);
    });
  }

  useEffect(() => {
    setInCompare(getCompareIds().includes(product.id));
  }, [product.id]);

  function handleToggleCompare() {
    const next = toggleCompare(product.id);
    setInCompare(next.includes(product.id));
  }

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={springHover}
      className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-3"
    >
      <Link
        href={`/${isAccessory ? "accessories" : "bikes"}/${product.slug}`}
        className="relative block aspect-4/3 overflow-hidden rounded-[6px] bg-surface-sunk"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="grid h-full place-items-center text-[11px] text-ink-muted">
            {product.name}
          </div>
        )}
      </Link>

      <div className="flex items-center gap-1.5">
        {product.isNew && <Chip variant="badge">NEW</Chip>}
        {product.bestSeller && <Chip variant="badge">BEST SELLER</Chip>}
        <div className="ml-auto flex items-center gap-1">
          {!isAccessory && (
            <button
              type="button"
              aria-label={inCompare ? "Remove from compare" : "Add to compare"}
              aria-pressed={inCompare}
              onClick={handleToggleCompare}
              className={cn(
                "grid size-11 place-items-center rounded-full hover:bg-surface-sunk",
                inCompare && "bg-[color-mix(in_srgb,var(--color-action)_12%,white)]",
              )}
            >
              <Scale
                className={cn("size-4", inCompare ? "text-action" : "text-ink-muted")}
                aria-hidden
              />
            </button>
          )}
          <button
            type="button"
            aria-label="Save"
            className="grid size-11 place-items-center rounded-full hover:bg-surface-sunk"
          >
            <Heart className="size-4 text-ink-muted" aria-hidden />
          </button>
        </div>
      </div>

      <Link href={`/${isAccessory ? "accessories" : "bikes"}/${product.slug}`}>
        <span className="font-body text-[15px] font-semibold text-ink">
          {product.name}
        </span>
      </Link>

      {isEbike && product.emiMonthly ? (
        <PriceBlock
          form="emi"
          monthly={product.emiMonthly}
          tenureMonths={product.emiTenureMonths ?? 24}
          mrp={product.mrp ?? product.price}
          price={product.price}
        />
      ) : (
        <PriceBlock
          form="flat"
          price={product.price}
          note={
            !isEbike && !isAccessory
              ? [product.gears && `${product.gears}-speed`, product.wheelSize]
                  .filter(Boolean)
                  .join(" · ")
              : undefined
          }
        />
      )}

      {isEbike && product.rangeKm && (
        <span className="text-[12px] text-ink-muted">
          {product.rangeKm} km per charge
        </span>
      )}

      {product.outOfStock ? (
        <Button variant="secondary" onClick={onNotifyMe} className="mt-1">
          Notify me
        </Button>
      ) : isAccessory ? (
        <Button variant="secondary" onClick={handleAdd} className="mt-1">
          Quick view
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={handleAdd}
          loading={pending}
          loadingLabel="Adding…"
          pulse={justAdded}
          className="mt-1"
        >
          {justAdded ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4" aria-hidden /> Added
            </span>
          ) : (
            "Add to cart"
          )}
        </Button>
      )}
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface-raised p-3"
      aria-hidden
    >
      <div className="aspect-4/3 animate-pulse rounded-[6px] bg-surface-sunk" />
      <div className="h-3 w-3/5 animate-pulse rounded bg-surface-sunk" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-surface-sunk" />
      <div className="h-9 w-full animate-pulse rounded bg-surface-sunk" />
    </div>
  );
}
