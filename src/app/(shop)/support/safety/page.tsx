import { SupportPageTemplate } from "@/components/support/SupportPageTemplate";

export default function SafetyPage() {
  return (
    <SupportPageTemplate
      title="Safety tips &amp; manual"
      intro="Ride safe, and know your bike. If we ever issue a safety notice, it will appear here and as a site-wide banner — never buried in a newsletter."
      items={[
        "Always wear a certified helmet",
        "Check tyre pressure weekly",
        "Charge only with the supplied charger",
        "User manual (PDF) — download from your order confirmation",
      ]}
    />
  );
}
