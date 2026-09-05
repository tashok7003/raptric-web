import Link from "next/link";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";

// 404 (2g) — one of the five error states, drawn rather than left to
// the framework default.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display text-[28px] font-bold text-ink">
          That page rode off somewhere
        </h1>
        <p className="mt-2 max-w-[40ch] text-[14px] text-ink-muted">
          The link might be old, or the page moved. Try the shop, or search
          for what you were after.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-[var(--radius-control)] bg-action px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[var(--color-action-hover)]"
        >
          Back to RAPTRIC
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
