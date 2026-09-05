"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, ShoppingCart, User, Menu, ChevronDown } from "lucide-react";
import { NAV_ITEMS, SHOP_DROPDOWN, SUPPORT_DROPDOWN } from "@/lib/siteConfig";
import type { ResolvedNavItem } from "@/lib/nav";
import { Drawer } from "@/components/ui/Drawer";
import { springGentle } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  variant?: "full" | "checkout";
  cartCount?: number;
  signedIn?: boolean;
  navItems?: ResolvedNavItem[];
}

// Chrome component, "full" variant — 2a. Serial-position order (Shop
// first, Journal last), 5 items capped, only 2 dropdowns, Compare is
// nav-level nowhere (tray only, wired in the listing/PDP pages).
export function SiteHeader({
  variant = "full",
  cartCount = 0,
  signedIn = false,
  navItems = NAV_ITEMS as unknown as ResolvedNavItem[],
}: SiteHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  if (variant === "checkout") {
    return (
      <header className="border-b border-[var(--color-border)] bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center">
          <Link href="/" className="font-display text-[19px] font-bold text-ink">
            RAPTRIC
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-display text-[19px] font-bold text-ink">
          RAPTRIC
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
              onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1 py-2 font-body text-[14px] font-medium text-ink hover:text-action"
                aria-haspopup={item.hasDropdown ? "menu" : undefined}
                aria-expanded={item.hasDropdown ? openDropdown === item.label : undefined}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="size-3.5" aria-hidden />}
              </Link>
              <AnimatePresence>
                {item.hasDropdown && openDropdown === item.label && (
                  <motion.div
                    role="menu"
                    initial={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                    transition={springGentle}
                    className="absolute left-0 top-full flex min-w-48 flex-col gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-2 shadow-lg"
                  >
                    {(item.label === "Shop" ? SHOP_DROPDOWN : SUPPORT_DROPDOWN).map(
                      (link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          role="menuitem"
                          className={cn(
                            "rounded-[6px] px-3 py-2 text-[13px] text-ink hover:bg-surface-sunk",
                            link.label === "Compare models" && "text-action",
                          )}
                        >
                          {link.label}
                        </Link>
                      ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="grid size-11 place-items-center rounded-full hover:bg-surface-sunk"
          >
            <Search className="size-5" aria-hidden />
          </button>
          <Link
            href={signedIn ? "/account" : "/sign-in"}
            aria-label="Account"
            className="grid size-11 place-items-center rounded-full hover:bg-surface-sunk"
          >
            <User className="size-5" aria-hidden />
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className="relative grid size-11 place-items-center rounded-full hover:bg-surface-sunk"
          >
            <ShoppingCart className="size-5" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-action text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="grid size-11 place-items-center rounded-full hover:bg-surface-sunk md:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Menu"
        side="right"
      >
        <nav className="flex flex-col gap-1" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="min-h-11 rounded-[6px] px-2 py-2.5 font-body text-[15px] font-semibold text-ink hover:bg-surface-sunk"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/test-ride"
          onClick={() => setMobileOpen(false)}
          className="mt-4 flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-action px-4 py-2.5 font-body text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          Book a test ride
        </Link>
      </Drawer>
    </header>
  );
}
