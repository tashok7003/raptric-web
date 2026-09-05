"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/cn";
import { signOutAction } from "@/lib/actions/auth";

const ITEMS = [
  { href: "/account", label: "Your bike" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/updates", label: "Updates" },
  { href: "/account/test-rides", label: "Test rides" },
  { href: "/account/documents", label: "Documents" },
  { href: "/account/saved", label: "Saved" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/privacy", label: "Privacy & data" },
];

// 12b — a side list, never eight tabs; 44px rows so 5c's target rule
// holds here too.
export function AccountNav({ name, phone }: { name: string | null; phone: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <nav className="flex w-full flex-col gap-1 md:w-48 md:shrink-0">
      <div className="mb-2 px-2">
        <span className="block text-[13px] font-semibold text-ink">
          {name || "Rider"}
        </span>
        <span className="block text-[12px] text-ink-muted">{phone}</span>
      </div>
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "min-h-11 rounded-[6px] px-2 py-2.5 text-[14px] font-medium",
              active ? "bg-[color-mix(in_srgb,var(--color-action)_10%,white)] text-action" : "text-ink hover:bg-surface-sunk",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await signOutAction();
            router.push("/");
            router.refresh();
          })
        }
        className="mt-2 min-h-11 rounded-[6px] px-2 py-2.5 text-left text-[13px] text-ink-muted hover:bg-surface-sunk"
      >
        Sign out
      </button>
    </nav>
  );
}
