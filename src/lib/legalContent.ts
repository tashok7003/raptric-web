/**
 * Placeholder legal copy. 12d flags this explicitly as a launch
 * blocker: "5 legal pages + privacy page reviewed by a lawyer" — this
 * text exists so the template and routes are real, not so the words
 * are final.
 */
export const LEGAL_PAGES: Record<string, { title: string; body: string }> = {
  "pricing-policy": {
    title: "Pricing Policy",
    body: "All prices shown are inclusive of GST. EMI figures assume no-cost financing via Bajaj Finserv and are indicative until confirmed at checkout. RAPTRIC reserves the right to revise prices without notice; a price displayed at the time of order placement is honoured.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "RAPTRIC collects your name, phone number, address and order history to fulfil orders, provide warranty service, and send order/service updates. Data is processed under the Digital Personal Data Protection Act, 2023. You can request an export or deletion of your data from Account → Privacy & data.",
  },
  terms: {
    title: "Terms of Service",
    body: "By placing an order you agree to RAPTRIC's pricing, delivery and warranty terms as displayed at checkout. Disputes are subject to the jurisdiction of Bengaluru courts.",
  },
  "cancellation-refund": {
    title: "Cancellation & Refund Policy",
    body: "Orders can be cancelled before delivery for a ₹1,500 fee. Every bike is quality-checked before it ships, so we don't offer returns or exchanges for change of mind once delivered. A manufacturing defect or missing/damaged part is covered under warranty — raise a claim from your account and we'll repair, replace, or refund as appropriate.",
  },
  shipping: {
    title: "Shipping Policy",
    body: "Bikes ship 90% assembled from your nearest RAPTRIC store or retail partner, with a short guided assembly to finish. Delivery is free within the serviceable zone; outside it, a ₹900 delivery fee applies. If your model is in stock locally, same-day pickup is possible; otherwise estimated delivery is 5-10 working days from payment confirmation.",
  },
};
