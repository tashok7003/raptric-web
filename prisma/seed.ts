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
  const HERO_SILVER = "https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop";
  const HERO_TEAL = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1200&auto=format&fit=crop";
  const HERO_ORANGE = "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?q=80&w=1200&auto=format&fit=crop";

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
    { slug: "m18", name: "RAPTRIC M18", mrp: 27500, price: 26500, emiMonthly: 1104, rangeKm: 45, heroImage: HERO_SILVER },
    { slug: "l27-pro", name: "RAPTRIC L27 Pro", mrp: 41000, price: 39500, emiMonthly: 1646, rangeKm: 65, heroImage: HERO_ORANGE },
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
    { slug: "m22", name: "RAPTRIC M22", price: 18500, gears: 21, wheelSize: '27.5"', heroImage: HERO_TEAL },
    { slug: "m14", name: "RAPTRIC M14", price: 14500, gears: 18, wheelSize: '26"', heroImage: HERO_SILVER },
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
