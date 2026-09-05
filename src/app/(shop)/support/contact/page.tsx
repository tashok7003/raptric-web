import { CANONICAL_CONTACT } from "@/lib/siteConfig";

// Contact (4c) — the canonical address/hours block, read from one
// source (siteConfig.ts) so it can't drift from the footer.
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-[24px] font-bold text-ink">Contact</h1>
      <div className="mt-4 flex flex-col gap-1 text-[15px] text-ink">
        <span>{CANONICAL_CONTACT.addressLine}</span>
        <span>{CANONICAL_CONTACT.phone}</span>
        <span className="text-ink-muted">{CANONICAL_CONTACT.hours}</span>
        <span className="text-ink-muted">{CANONICAL_CONTACT.careLineHours}</span>
      </div>
      <p className="mt-6 text-[13px] text-ink-muted">
        For an order or warranty question, sign in and use Account → Updates
        first — it's usually faster than a call.
      </p>
    </div>
  );
}
