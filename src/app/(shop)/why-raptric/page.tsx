import { StatBox } from "@/components/ui/StatBox";
import { Store, Users, ShieldCheck, TrendingUp } from "lucide-react";
import { WARRANTY } from "@/lib/siteConfig";

// Why RAPTRIC (4a) — "the page the PRD names first in the sitemap,"
// carrying the flagship-store anchor, the retail-partner story, and the
// growth proof that otherwise lives only in a stat bar on the homepage.
export default function WhyRaptricPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-[32px] font-bold leading-tight text-ink">
        Built for the daily commute, not the weekend ride.
      </h1>
      <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-ink-muted">
        RAPTRIC started at our own store in Banashankari, Bengaluru — still
        the anchor of the network, the same one named on our compare tool,
        our store finder, and every trust bar on the site. Today, 20+ retail
        partners carry that same standard across the city.
      </p>

      <div className="mt-8">
        <StatBox
          items={[
            { label: "20+ retail partners", icon: <Store className="size-5 text-action" /> },
            { label: "1,200+ riders", icon: <Users className="size-5 text-action" /> },
            { label: WARRANTY.headline, icon: <ShieldCheck className="size-5 text-action" /> },
            { label: "4 years, 1 focus", icon: <TrendingUp className="size-5 text-action" /> },
          ]}
        />
      </div>

      <div className="mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-ink">
        <div>
          <h2 className="font-body text-[18px] font-bold text-ink">
            Why no-cost EMI
          </h2>
          <p className="mt-1 text-ink-muted">
            The Practical Commuter — 60% of who buys from us — doesn't have
            ₹35,000 sitting free. They have ₹1,458 a month. EMI isn't a
            financing gimmick here; it's the actual product decision that
            everything else was built around.
          </p>
        </div>
        <div>
          <h2 className="font-body text-[18px] font-bold text-ink">
            Why a store network, not a warehouse
          </h2>
          <p className="mt-1 text-ink-muted">
            A ₹35,000 purchase deserves a test ride, not just a spec sheet. Our
            store and every retail partner do test rides, service, and
            warranty work under one standard — not a courier drop-off.
          </p>
        </div>
      </div>
    </div>
  );
}
