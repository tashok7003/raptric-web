/**
 * The one canonical source for chrome content (2a). Hours/address/phone
 * exist in exactly one place so the "Mon–Sun vs Mon–Sat" drift the
 * wireframe review caught can't recur. The CMS nav editor (4h) reads and
 * writes NavItem rows and enforces the 5-item cap in the tool itself —
 * this file is the launch-time default / fallback.
 */

export const NAV_ITEMS = [
  { label: "Shop", href: "/bikes", hasDropdown: true },
  { label: "Why RAPTRIC", href: "/why-raptric", hasDropdown: false },
  { label: "Find a Store", href: "/stores", hasDropdown: false },
  { label: "Support", href: "/support", hasDropdown: true },
  { label: "Journal", href: "/journal", hasDropdown: false },
] as const;

export const SHOP_DROPDOWN = [
  { label: "eBikes", href: "/bikes?type=ebike" },
  { label: "mBikes", href: "/bikes?type=mbike" },
  { label: "Accessories", href: "/accessories" },
  { label: "Compare models", href: "/compare" },
] as const;

export const SUPPORT_DROPDOWN = [
  { label: "FAQ", href: "/support/faq" },
  { label: "Service & maintenance", href: "/support/service" },
  { label: "Warranty & activation", href: "/support/warranty" },
  { label: "Safety tips · Manual", href: "/support/safety" },
  { label: "Contact", href: "/support/contact" },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "eBikes", href: "/bikes?type=ebike" },
      { label: "mBikes", href: "/bikes?type=mbike" },
      { label: "Accessories", href: "/accessories" },
      { label: "Compare models", href: "/compare" },
      { label: "Find a store", href: "/stores" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ", href: "/support/faq" },
      { label: "Service", href: "/support/service" },
      { label: "Warranty · Activate", href: "/support/warranty" },
      { label: "Safety · Manual", href: "/support/safety" },
      { label: "Track my order", href: "/account/orders" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Why RAPTRIC", href: "/why-raptric" },
      { label: "Journal", href: "/journal" },
      { label: "Reviews", href: "/reviews" },
      { label: "Become a retailer", href: "/retailers" },
      { label: "Contact", href: "/support/contact" },
    ],
  },
] as const;

// One canonical field, per 2a's fix for the hours drift — the retail
// network's contact block. The separate care-line hours (13c) are labelled
// apart, not merged into this one.
//
// One flagship store (RAPTRIC's own — Banashankari, Bengaluru) plus a
// growing network of retail partners, not 20 company-owned stores —
// `addressLine` is the network-scale summary used in marketing copy;
// `flagshipAddress` is the literal visit-us address for the footer.
export const CANONICAL_CONTACT = {
  addressLine: "20+ retail partners across Bengaluru",
  flagshipAddress: "367, 10th Main, Vidyapeeta Main Road, Banashankari 3rd Stage, Bengaluru 560085",
  phone: "+91 93802 76355",
  hours: "Store open Mon–Sun, 10:30am–8:30pm",
  careLineHours: "Care line Mon–Sat, 10:00–19:00",
};

// Real RAPTRIC socials (raptric.in) — @rideraptric everywhere.
export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/rideraptric" },
  { label: "Instagram", href: "https://www.instagram.com/rideraptric" },
  { label: "Twitter", href: "https://www.twitter.com/rideraptric" },
] as const;

export const PAYMENT_MARKS = ["UPI", "Card", "Bajaj EMI"] as const;

export const LEGAL_LINKS = [
  { label: "Pricing Policy", href: "/legal/pricing-policy" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cancellation & Refund", href: "/legal/cancellation-refund" },
  { label: "Shipping", href: "/legal/shipping" },
] as const;

// Warranty ladder (turn 6/9's fix) — worded identically everywhere.
// Numbers match RAPTRIC's real published warranty schedule (raptric.in).
export const WARRANTY = {
  headline: "5-yr frame warranty",
  ladder: [
    { part: "Frame", months: 60 },
    { part: "Battery", months: 24 },
    { part: "Hub motor", months: 24 },
    { part: "Other electronics", months: 6 },
  ],
  claimPickupFee: 250,
};

// One EMI rule (12d) — every card's "from ₹" and the explainer's
// calculator read from this.
export const EMI = {
  tenuresMonths: [6, 12, 18, 24] as const,
  noCost: true,
  provider: "Bajaj Finserv",
};

export const CANCELLATION_FEE = 1500;
export const AGENT_REFUND_CAP = 5000;
export const RESERVE_HOLD_HOURS = 48;
export const CART_MAX_QTY = 4; // Bajaj won't finance 6 bikes to one PAN (14d)
