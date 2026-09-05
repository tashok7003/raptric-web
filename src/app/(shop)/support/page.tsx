import Link from "next/link";
import { SUPPORT_DROPDOWN } from "@/lib/siteConfig";

export default function SupportIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-[24px] font-bold text-ink">Support</h1>
      <div className="mt-6 flex flex-col gap-2">
        {SUPPORT_DROPDOWN.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 text-[15px] font-medium text-ink hover:border-ink"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
