import { SupportPageTemplate } from "@/components/support/SupportPageTemplate";

export default function ServicePage() {
  return (
    <SupportPageTemplate
      title="Service &amp; maintenance"
      intro="Every RAPTRIC includes a free 30-day check-up at any store. After that, service is available at all 20 stores — book from Account → Your bike."
      items={[
        "Free 30-day check-up (included with every bike)",
        "Brake and gear tuning — ₹300",
        "Battery health check — free",
        "Tyre replacement — from ₹450",
      ]}
    />
  );
}
