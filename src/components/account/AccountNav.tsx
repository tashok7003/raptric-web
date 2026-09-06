"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/cn";
import { signOutAction } from "@/lib/actions/auth";
import type { Role } from "@/generated/prisma/enums";

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

const ROLE_LABELS: Record<Role, string> = {
  RIDER: "Rider",
  FOUNDER: "Founder",
  OPS_LEAD: "Ops lead",
  SUPPORT_AGENT: "Support agent",
  MARKETING_EDITOR: "Marketing editor",
  RETAILER: "Retailer partner",
  ADMIN: "Admin",
};

// Which internal console each staff role reaches — ADMIN passes every
// layout's role check (see src/app/{cms,ops,support-console}/layout.tsx)
// so it gets shortcuts to all three.
const CONSOLE_LINKS: Partial<Record<Role, { href: string; label: string }[]>> = {
  ADMIN: [
    { href: "/cms/products", label: "Go to CMS" },
    { href: "/ops/orders", label: "Go to Ops console" },
    { href: "/support-console", label: "Go to Support console" },
  ],
  MARKETING_EDITOR: [{ href: "/cms/products", label: "Go to CMS" }],
  OPS_LEAD: [{ href: "/ops/orders", label: "Go to Ops console" }],
  SUPPORT_AGENT: [{ href: "/support-console", label: "Go to Support console" }],
};

// 12b — a side list, never eight tabs; 44px rows so 5c's target rule
// holds here too. Staff/retailer roles get a badge and shortcuts bolted
// on top rather than a fork of this component — they can still have a
// rider's own orders/bike under the same login.
export function AccountNav({ name, phone, role }: { name: string | null; phone: string; role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const consoleLinks = CONSOLE_LINKS[role];

  return (
    <nav className="flex w-full flex-col gap-1 md:w-48 md:shrink-0">
      <div className="mb-2 px-2">
        <span className="block text-[13px] font-semibold text-ink">
          {name || "Rider"}
        </span>
        <span className="block text-[12px] text-ink-muted">{phone}</span>
        {role !== "RIDER" && (
          <span className="mt-1 inline-block rounded-full bg-[color-mix(in_srgb,var(--color-action)_12%,white)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-action">
            {ROLE_LABELS[role]}
          </span>
        )}
      </div>
      {consoleLinks && (
        <div className="mb-2 flex flex-col gap-1 border-b border-[var(--color-border)] pb-2">
          {consoleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-11 rounded-[6px] px-2 py-2.5 text-[14px] font-semibold text-action hover:bg-surface-sunk"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
      {role === "RETAILER" && (
        <div className="mb-2 flex flex-col gap-1 border-b border-[var(--color-border)] pb-2">
          <Link
            href="/account/retailer"
            className={cn(
              "min-h-11 rounded-[6px] px-2 py-2.5 text-[14px] font-semibold text-action hover:bg-surface-sunk",
              pathname === "/account/retailer" && "bg-[color-mix(in_srgb,var(--color-action)_10%,white)]",
            )}
          >
            Retailer dashboard
          </Link>
        </div>
      )}
      {/* A wholesale retailer account doesn't have a bike, orders, or test
          rides of its own under this login — the rider menu just dilutes
          the one thing this account is actually for. */}
      {role !== "RETAILER" &&
        ITEMS.map((item) => {
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
