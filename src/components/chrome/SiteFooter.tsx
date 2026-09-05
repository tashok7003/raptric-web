import Link from "next/link";
import {
  FOOTER_COLUMNS,
  CANONICAL_CONTACT,
  PAYMENT_MARKS,
  LEGAL_LINKS,
} from "@/lib/siteConfig";

interface SiteFooterProps {
  variant?: "full" | "checkout";
}

// Chrome component, footer — 2a. "One definition, one source per field" —
// hours/address/phone are read from CANONICAL_CONTACT everywhere, never
// retyped. Checkout variant is legal-only, no marketing links (2a's
// deliberate exception for the payment flow).
export function SiteFooter({ variant = "full" }: SiteFooterProps) {
  if (variant === "checkout") {
    return (
      <footer className="border-t border-[var(--color-border)] bg-ink px-4 py-4 text-[#b8b1a6]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 text-[11px]">
          <span>Secured by Razorpay</span>
          <span className="ml-auto flex gap-3">
            {LEGAL_LINKS.slice(0, 2).map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </span>
          <span>{CANONICAL_CONTACT.phone}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto bg-ink px-4 py-8 text-[#b8b1a6]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading} className="flex flex-col gap-2">
            <span className="font-body text-[11px] font-bold text-white">
              {col.heading}
            </span>
            {col.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
          <span className="font-body text-[11px] font-bold text-white">
            Get in touch
          </span>
          <p className="text-[13px]">
            {CANONICAL_CONTACT.addressLine}
            <br />
            {CANONICAL_CONTACT.phone}
            <br />
            {CANONICAL_CONTACT.hours}
            <br />
            {CANONICAL_CONTACT.careLineHours}
          </p>
          <div className="flex gap-2">
            {PAYMENT_MARKS.map((mark) => (
              <span
                key={mark}
                className="rounded-full border border-[#4a453d] px-2 py-0.5 text-[11px]"
              >
                {mark}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center gap-4 border-t border-[#4a453d] pt-3 text-[12px]">
        {LEGAL_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-white">
            {l.label}
          </Link>
        ))}
        <span className="ml-auto">© 2026 RAPTRIC</span>
      </div>
    </footer>
  );
}
