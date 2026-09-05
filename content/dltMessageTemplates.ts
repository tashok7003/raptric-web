/**
 * DLT message templates (12a) — step 0 of the build order (12c): "42
 * templates (21 × 2 languages) to the operator for DLT approval. It is
 * the longest lead time in the whole plan and the cheapest thing on
 * it." This file is the content artifact that submission needs.
 *
 * Marathi versions are a follow-up per 11f's commitment ("all 21
 * registered in both languages from day one, keyed off the rider's
 * preference") — not written here yet; this is the English half of
 * that pair, real enough to submit for the English templates while
 * translation happens in parallel.
 *
 * Rules the copy follows (12a): the event in the first four words,
 * never "Dear customer" and never the brand name first; one deep-
 * linked, signed-in-where-possible link; full amounts only where they
 * reassure (refunds), never the frame number; "Nothing was charged" in
 * every failure; a reason in every cancellation, ours or the store's.
 */

export interface MessageTemplateContent {
  key: string;
  channel: "sms" | "whatsapp" | "email";
  optOutAllowed: boolean;
  body: string;
}

export const DLT_MESSAGE_TEMPLATES: MessageTemplateContent[] = [
  // Essential (16) — no opt-out; you cannot opt out of being told your
  // bike is at the door.
  {
    key: "otp_login",
    channel: "sms",
    optOutAllowed: false,
    body: "{code} is your RAPTRIC code. Valid 10 minutes. Don't share it with anyone, including us. — RAPTRIC",
  },
  {
    key: "order_placed",
    channel: "sms",
    optOutAllowed: false,
    body: "Order confirmed — {model}, ₹{amount}. We'll text you the delivery day within 24 hours. Details: {link} — RAPTRIC",
  },
  {
    key: "payment_failed",
    channel: "sms",
    optOutAllowed: false,
    body: "Your payment for {model} didn't go through and nothing was charged. Your cart is still here: {link} — RAPTRIC",
  },
  {
    key: "upi_pending",
    channel: "sms",
    optOutAllowed: false,
    body: "Still waiting on your bank for {model}. Don't pay again — we'll text the moment it clears, or by {time}. — RAPTRIC",
  },
  {
    key: "emi_approved",
    channel: "sms",
    optOutAllowed: false,
    body: "Approved — {tenure} months at ₹{emi}/month for your {model}. Finish your order: {link} — RAPTRIC",
  },
  {
    key: "emi_declined",
    channel: "sms",
    optOutAllowed: false,
    body: "Bajaj couldn't approve the EMI this time. You can still pay by UPI or card, or split it at a store: {link} — RAPTRIC",
  },
  {
    key: "order_dispatched",
    channel: "sms",
    optOutAllowed: false,
    body: "Your {model} ships today and arrives {date}. Assembled, charged, ready to ride. Track: {link} — RAPTRIC",
  },
  {
    key: "out_for_delivery",
    channel: "sms",
    optOutAllowed: false,
    body: "Your {model} arrives today by {window}. {rider} will call before reaching. Track: {link} — RAPTRIC",
  },
  {
    key: "order_delivered",
    channel: "sms",
    optOutAllowed: false,
    body: "Enjoy the {model}. Activate your warranty in 2 minutes so it's on record: {link} — RAPTRIC",
  },
  {
    key: "invoice_ready",
    channel: "email",
    optOutAllowed: false,
    body: "Subject: Your RAPTRIC invoice — {invoice_no}. Attached: tax invoice, warranty card. Your frame number is on both.",
  },
  {
    key: "ride_confirmed",
    channel: "sms",
    optOutAllowed: false,
    body: "Test ride booked — {store}, {date} at {time}. Bring any ID. Ask for {contact}. Change it: {link} — RAPTRIC",
  },
  {
    key: "ride_reminder",
    channel: "sms",
    optOutAllowed: false,
    body: "Your {model} test ride is at {time} today, {store}. {maps} — RAPTRIC",
  },
  {
    key: "ride_cancelled_by_store",
    channel: "sms",
    optOutAllowed: false,
    body: "{store} can't make {time} — {reason}. Pick another slot or try {alt_store}, 4 km away: {link} — RAPTRIC",
  },
  {
    key: "reserve_expiring",
    channel: "sms",
    optOutAllowed: false,
    body: "Your {model} hold at {store} ends in 6 hours. Keep it: {link} — RAPTRIC",
  },
  {
    key: "claim_received",
    channel: "sms",
    optOutAllowed: false,
    body: "Claim {claim_no} logged for your {model}. We'll have a decision within 3 working days. — RAPTRIC",
  },
  {
    key: "claim_decided",
    channel: "sms",
    optOutAllowed: false,
    body: "Claim {claim_no}: {outcome}. Pickup on {date}, ₹250 payable to the rider. Details: {link} — RAPTRIC",
  },
  // Transactional follow-ups (3) — still no opt-out.
  {
    key: "pickup_scheduled",
    channel: "sms",
    optOutAllowed: false,
    body: "We'll collect your {model} on {date}, {window}. Keep the charger with it. — RAPTRIC",
  },
  {
    key: "refund_initiated",
    channel: "sms",
    optOutAllowed: false,
    body: "Refund of ₹{amount} sent to your {method}. Banks take 5-7 working days. Reference {ref}. — RAPTRIC",
  },
  {
    key: "retailer_application",
    channel: "email",
    optOutAllowed: false,
    body: "Subject: Your RAPTRIC retailer application — {stage}. {name} will call you on {date}.",
  },
  // Asked-for (5) — the opt-out line is the tell: these carry "Reply
  // STOP", the other 19 don't, and that difference is what keeps the
  // transactional sender ID clean.
  {
    key: "service_due",
    channel: "sms",
    optOutAllowed: true,
    body: "Your {model} is due its {n}-month service. Free at {store} — book a slot: {link}. Reply STOP to opt out. — RAPTRIC",
  },
  {
    key: "stock_back",
    channel: "sms",
    optOutAllowed: true,
    body: "The {model} is back — {count} in stock. You asked us to tell you. {link}. Reply STOP to opt out. — RAPTRIC",
  },
  {
    key: "store_opened",
    channel: "sms",
    optOutAllowed: true,
    body: "A RAPTRIC store just opened in {area} — test rides from {date}. {link}. Reply STOP to opt out. — RAPTRIC",
  },
  {
    key: "review_invite",
    channel: "sms",
    optOutAllowed: true,
    body: "A month with the {model} — how is it? 2 minutes, and it helps the next buyer: {link}. Reply STOP to opt out. — RAPTRIC",
  },
  {
    key: "ride_missed_followup",
    channel: "sms",
    optOutAllowed: true,
    body: "Missed us at {store}? Book again in one tap, same bike: {link}. Reply STOP to opt out. — RAPTRIC",
  },
];
