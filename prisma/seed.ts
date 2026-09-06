import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DLT_MESSAGE_TEMPLATES } from "../content/dltMessageTemplates";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // eBikes — EMI-first, per 4b's card reasoning. Placeholders per the
  // wireframe's own admission (turn 9 note): "L27+/L27/X26/M22 are my
  // placeholders" pending the real catalogue.
  // Stock studio shots — placeholders until the real catalogue photography
  // lands, same spirit as the price points above (turn 9 note).
  // One distinct photo per SKU — three products used to share HERO_SILVER
  // and two shared HERO_ORANGE, which read as fake/duplicated inventory
  // when placed side by side at different prices.
  //
  // The first fix for this (HERO_SLATE/CHARCOAL/GRAPHITE) picked three
  // Unsplash photo IDs that returned HTTP 200 but were never actually
  // opened — a live audit found they render a motorcycle, a road-racing
  // peloton, and an empty European street respectively, on an "eBikes for
  // the daily commute" site. Every URL below has been downloaded and
  // visually confirmed to show an actual (e-)bicycle before use.
  const HERO_SILVER = "https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop";
  const HERO_TEAL = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop";
  const HERO_ORANGE = "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?q=80&w=1200&auto=format&fit=crop";
  const HERO_SLATE = "https://images.unsplash.com/photo-1579119099178-c0e502392c6d?q=80&w=1200&auto=format&fit=crop";
  const HERO_CHARCOAL = "https://images.unsplash.com/photo-1608315757518-aa845d86e9bd?q=80&w=1200&auto=format&fit=crop";
  const HERO_GRAPHITE = "https://images.unsplash.com/photo-1666359692855-676ac6c8df4c?q=80&w=1200&auto=format&fit=crop";
  const HERO_RUST = "https://images.unsplash.com/photo-1571188654248-7a89213915f7?q=80&w=1200&auto=format&fit=crop";

  const ebikes = [
    {
      slug: "l27-plus",
      name: "RAPTRIC L27+",
      mrp: 36500,
      price: 35000,
      emiMonthly: 1458,
      rangeKm: 60,
      bestSeller: true,
      heroImage: HERO_SILVER,
    },
    {
      slug: "l27",
      name: "RAPTRIC L27",
      mrp: 33000,
      price: 32000,
      emiMonthly: 1333,
      rangeKm: 55,
      heroImage: HERO_TEAL,
    },
    {
      slug: "x26",
      name: "RAPTRIC X26",
      mrp: 30500,
      price: 29500,
      emiMonthly: 1229,
      rangeKm: 50,
      bestSeller: true,
      heroImage: HERO_ORANGE,
    },
    { slug: "m18", name: "RAPTRIC M18", mrp: 27500, price: 26500, emiMonthly: 1104, rangeKm: 45, heroImage: HERO_SLATE },
    { slug: "l27-pro", name: "RAPTRIC L27 Pro", mrp: 41000, price: 39500, emiMonthly: 1646, rangeKm: 65, heroImage: HERO_CHARCOAL },
  ];

  for (const b of ebikes) {
    await db.productModel.upsert({
      where: { slug: b.slug },
      update: { heroImage: b.heroImage },
      create: {
        slug: b.slug,
        kind: "EBIKE",
        name: b.name,
        mrp: b.mrp,
        price: b.price,
        emiMonthly: b.emiMonthly,
        emiTenureMonths: 24,
        rangeKm: b.rangeKm,
        bestSeller: b.bestSeller ?? false,
        heroImage: b.heroImage,
        globalStock: 40,
        status: "LIVE",
        publishedAt: new Date(),
      },
    });
  }

  const mbikes = [
    { slug: "m22", name: "RAPTRIC M22", price: 18500, gears: 21, wheelSize: '27.5"', heroImage: HERO_GRAPHITE },
    { slug: "m14", name: "RAPTRIC M14", price: 14500, gears: 18, wheelSize: '26"', heroImage: HERO_RUST },
  ];
  for (const b of mbikes) {
    await db.productModel.upsert({
      where: { slug: b.slug },
      update: { heroImage: b.heroImage },
      create: {
        slug: b.slug,
        kind: "MBIKE",
        name: b.name,
        mrp: b.price,
        price: b.price,
        gears: b.gears,
        wheelSize: b.wheelSize,
        heroImage: b.heroImage,
        globalStock: 30,
        status: "LIVE",
        publishedAt: new Date(),
      },
    });
  }

  await db.productModel.upsert({
    where: { slug: "commuter-helmet" },
    update: {},
    create: {
      slug: "commuter-helmet",
      kind: "ACCESSORY",
      name: "Commuter Helmet",
      mrp: 1200,
      price: 1200,
      globalStock: 100,
      status: "LIVE",
      publishedAt: new Date(),
    },
  });

  // Earlier seed runs created a fictional "JBC Pune" store under a
  // different slug; clean it up so it doesn't linger alongside the real
  // flagship below. Safe as long as nothing was ordered/booked against
  // it in this dev DB — ignored if that's not the case.
  try {
    await db.store.delete({ where: { slug: "jbc-pune" } });
  } catch {
    // either never seeded, or has dependent rows — leave it alone
  }

  // The real flagship store (raptric.in) — RAPTRIC's own, distinct from
  // the 20+ retail partners the BD pipeline (Retailer model) onboards.
  await db.store.upsert({
    where: { slug: "raptric-banashankari" },
    update: {},
    create: {
      name: "RAPTRIC Banashankari",
      slug: "raptric-banashankari",
      address: "367, 10th Main, Vidyapeeta Main Road, Banashankari 3rd Stage",
      city: "Bengaluru",
      pincode: "560085",
      hoursJson: JSON.stringify({ "mon-sun": "10:30-20:30" }),
      phone: "+91 93802 76355",
      servicesJson: JSON.stringify(["test-ride", "service", "collect-in-store"]),
    },
  });

  await db.user.upsert({
    where: { phone: "+919999999999" },
    update: { role: "ADMIN" },
    create: { phone: "+919999999999", name: "Admin", role: "ADMIN" },
  });

  // Demo retailer login for the self-service dashboard at /account/retailer
  // — a real partner account reaches RETAILER the same way any of the 20+
  // BD-pipeline retailers would: apply via /retailers, get approved in
  // /ops/retailers, then someone sets their user's role + retailerId.
  const demoRetailer = await db.retailer.upsert({
    where: { id: "retailer-demo" },
    update: { status: "LIVE" },
    create: {
      id: "retailer-demo",
      name: "Kothrud Cycle Hub",
      ownerName: "Suresh Patil",
      phone: "+919888888888",
      status: "LIVE",
      territoryPin: "411038",
    },
  });
  await db.user.upsert({
    where: { phone: "+919888888888" },
    update: { role: "RETAILER", retailerId: demoRetailer.id },
    create: {
      phone: "+919888888888",
      name: "Suresh Patil",
      role: "RETAILER",
      retailerId: demoRetailer.id,
    },
  });
  const [wholesaleL27Plus, wholesaleM22] = await Promise.all([
    db.productModel.findUnique({ where: { slug: "l27-plus" } }),
    db.productModel.findUnique({ where: { slug: "m22" } }),
  ]);
  await db.wholesaleOrder.deleteMany({ where: { retailerId: demoRetailer.id } });
  if (wholesaleL27Plus && wholesaleM22) {
    await db.wholesaleOrder.createMany({
      data: [
        { retailerId: demoRetailer.id, modelId: wholesaleL27Plus.id, quantity: 10, consignment: true, status: "DELIVERED" },
        { retailerId: demoRetailer.id, modelId: wholesaleM22.id, quantity: 5, consignment: false, status: "PENDING" },
      ],
    });
  }

  // Default homepage sections — matches the page's original hardcoded
  // design exactly, so /cms/home starts from what's already live rather
  // than a blank page an editor has to reconstruct from scratch.
  const homeSections = [
    {
      id: "home-hero",
      type: "HERO",
      order: 0,
      heading: "The commute, sorted.",
      body: "₹35,000 becomes ₹1,458 a month — no-cost EMI on every RAPTRIC eBike, backed by a 5-year frame warranty and 20+ retail partners across Bengaluru.",
      imageUrl: "https://images.unsplash.com/photo-1519583272095-6433daf26b6e?q=80&w=1920&auto=format&fit=crop",
      ctaLabel: "Shop eBikes",
      ctaHref: "/bikes?type=ebike",
      configJson: JSON.stringify({ secondaryCtaLabel: "How EMI works", secondaryCtaHref: "/emi" }),
    },
    {
      id: "home-stats",
      type: "STAT_BAR",
      order: 1,
      configJson: JSON.stringify({
        items: ["20+ retail partners", "4.4★ · 1,200+ riders", "60 km per charge", "5-yr frame warranty"],
      }),
    },
    {
      id: "home-products",
      type: "PRODUCT_GRID",
      order: 2,
      heading: "eBikes & mBikes",
      ctaLabel: "Compare all",
      ctaHref: "/compare",
      configJson: JSON.stringify({ kind: "ALL", limit: 8 }),
    },
  ];
  for (const s of homeSections) {
    const { id, ...data } = s;
    await db.homeSection.upsert({ where: { id }, update: {}, create: { id, ...data } });
  }

  // Default nav — seeded as real NavItem rows (not left to the
  // siteConfig.ts fallback) so /cms/nav has something to reorder/rename/
  // remove from day one instead of showing an empty list standing in for
  // a nav that already has 4 items live.
  const navItems = [
    { id: "nav-shop", label: "Shop", href: "/bikes", order: 0, hasDropdown: true },
    { id: "nav-why-raptric", label: "Why RAPTRIC", href: "/why-raptric", order: 1, hasDropdown: false },
    { id: "nav-find-a-store", label: "Find a Store", href: "/stores", order: 2, hasDropdown: false },
    { id: "nav-support", label: "Support", href: "/support", order: 3, hasDropdown: true },
  ];
  for (const n of navItems) {
    const { id, ...data } = n;
    await db.navItem.upsert({ where: { id }, update: {}, create: { id, ...data } });
  }

  for (const t of DLT_MESSAGE_TEMPLATES) {
    await db.messageTemplate.upsert({
      where: { key: t.key },
      update: { channel: t.channel, optOutAllowed: t.optOutAllowed, body: t.body },
      create: { key: t.key, channel: t.channel, optOutAllowed: t.optOutAllowed, body: t.body, locale: "en" },
    });
  }

  // Earlier seed runs used .create() with no natural key, so re-seeding
  // duplicated rows every time. Clearing first makes this idempotent —
  // safe since FaqItem is pure seed/CMS content, never user data.
  await db.faqItem.deleteMany({});

  // Real questions/answers from raptric.in's own FAQ, adapted where the
  // wording assumed a single store (this app models a growing network).
  const faqs = [
    {
      id: "faq-emi",
      question: "How does no-cost EMI work?",
      answer: "Bajaj Finserv splits the price over 6/12/18/24 months at zero extra cost — pick a tenure at checkout.",
      category: "Payments",
    },
    {
      id: "faq-payment-modes",
      question: "What modes of payment are accepted?",
      answer: "UPI, credit/debit cards, and netbanking online. Cash is accepted in-store only.",
      category: "Payments",
    },
    {
      id: "faq-cod",
      question: "Do you have an option for cash-on-delivery (COD)?",
      answer: "We don't support COD. Pay online via UPI, card, or netbanking, or pay cash at a store.",
      category: "Payments",
    },
    {
      id: "faq-payment-failed",
      question: "My payment was deducted but the order shows failed — what do I do?",
      answer: "Don't worry — call our care line and we'll confirm the payment status. If we haven't received it, the amount is usually reversed by your bank automatically.",
      category: "Payments",
    },
    {
      id: "faq-warranty",
      question: "What does the warranty cover?",
      answer: "Frame 5 years, battery and hub motor 2 years, other electronics 6 months — manufacturing defects only, repaired or replaced at our discretion.",
      category: "Warranty",
    },
    {
      id: "faq-servicing",
      question: "How often does a RAPTRIC need servicing?",
      answer: "Our bikes are largely maintenance-free, but we recommend a health check at least once every 3-4 months.",
      category: "Service",
    },
    {
      id: "faq-assembly",
      question: "Does the bike come fully assembled?",
      answer: "It arrives 90% assembled in a well-packaged carton. A short video walks you through the last steps — usually under 30 minutes if done by someone experienced.",
      category: "Assembly",
    },
    {
      id: "faq-returns",
      question: "What is your returns / exchange policy?",
      answer: "Every bike is quality-tested before it ships, so returns for change-of-mind aren't offered. For a manufacturing defect or a missing/damaged part, raise a claim and we'll make it right.",
      category: "Returns",
    },
    {
      id: "faq-delivery",
      question: "When can I collect my bike after ordering?",
      answer: "If your nearest store already stocks the model, same-day pickup is possible — call ahead to confirm. Otherwise, delivery typically takes 5-10 working days.",
      category: "Service",
    },
  ];
  for (const f of faqs) {
    const { id, ...data } = f;
    await db.faqItem.upsert({
      where: { id },
      update: { ...data, status: "LIVE" },
      create: { id, ...data, status: "LIVE" },
    });
  }

  console.log("Seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
