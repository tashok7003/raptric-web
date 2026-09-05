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

  await db.store.upsert({
    where: { slug: "jbc-pune" },
    update: {},
    create: {
      name: "JBC Pune",
      slug: "jbc-pune",
      address: "Jangli Maharaj Road, Pune",
      city: "Pune",
      pincode: "411001",
      hoursJson: JSON.stringify({ "mon-sun": "10:00-20:00" }),
      phone: "+91 88888 00001",
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

  const faqs = [
    { question: "How does no-cost EMI work?", answer: "Bajaj Finserv splits the price over 6/12/18/24 months at zero extra cost.", category: "EMI" },
    { question: "What does the 2-year warranty cover?", answer: "Frame 2 years, motor 18 months, battery 12 months.", category: "Warranty" },
  ];
  for (const f of faqs) {
    await db.faqItem.create({ data: { ...f, status: "LIVE" } });
  }

  console.log("Seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
