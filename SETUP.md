# Running RAPTRIC locally

This is the full source for the RAPTRIC storefront + CMS + internal consoles,
built from the wireframe handoff. Everything runs against a real Postgres
database — there's no separate "demo mode."

## Prerequisites

- Node.js 20+ (`node -v` to check)
- PostgreSQL 14+ running locally (or any reachable Postgres instance)

## 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

(`--legacy-peer-deps` works around an npm/arborist bug with a couple of
transitive dependencies — not project-specific.)

## 2. Create a database

```bash
createuser raptric --pwprompt   # set a password when prompted, e.g. raptric_dev_pw
createdb raptric -O raptric
```

## 3. Configure environment

Create `.env` in the project root:

```
DATABASE_URL="postgresql://raptric:raptric_dev_pw@localhost:5432/raptric"
```

(swap in whatever user/password/db name you actually created)

## 4. Run migrations and seed data

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

This creates the schema and seeds: 5 eBikes, 2 mBikes, 1 accessory, the JBC
Pune store, 2 FAQ entries, 24 DLT message templates, and an admin account
(phone `+919999999999`, role ADMIN — can access `/cms`, `/ops`,
`/support-console`).

## 5. Run it

```bash
npm run dev
```

Open http://localhost:3000

## Signing in (OTP, sandbox mode)

There's no real SMS provider connected yet, so the OTP flow shows the code
directly on screen instead of texting it (clearly labelled "Sandbox mode").
Use `+919999999999` to sign in as the seeded admin, or any phone number to
create a new rider account.

## Checkout (payments, sandbox mode)

Same story for Razorpay/Bajaj EMI — no live credentials yet, so checkout
shows "Simulate: Paid / Failed / UPI pending" buttons instead of a real
payment widget once you reach the payment step. The EMI decision is
deterministic based on the phone number's last digit (see
`src/lib/payments/mock.ts` if you want to see exactly why a given number
gets approved/declined/pending).

## Where things live

- `/` — storefront (home, `/bikes`, `/compare`, `/cart`, `/checkout`, `/account`, `/journal`, `/stores`, `/support/*`, `/why-raptric`, `/legal/*`, `/retailers`)
- `/cms` — product/journal/nav editor (needs MARKETING_EDITOR or ADMIN role)
- `/ops` — order management, stock, serviceability, retailer pipeline (needs OPS_LEAD or ADMIN)
- `/support-console` — customer lookup, failed payments, claims queue (needs SUPPORT_AGENT or ADMIN)

To test a narrower role than ADMIN (which passes every check), change a
user's role directly in the database, e.g.:

```sql
UPDATE "User" SET role = 'OPS_LEAD' WHERE phone = '+919999999999';
```

## What's real vs. sandboxed

Everything is a real Next.js + Postgres app — no mock data layer, no
fixtures swapped in for a "demo." The only things standing in for something
real are the three integrations nobody has credentials for yet: the SMS
provider (OTP/notifications), Razorpay (payments), and Bajaj (EMI decisions).
Each has a clean adapter interface (`src/lib/sms.ts`, `src/lib/payments/`)
that switches to the real thing automatically the moment the corresponding
env vars are set — no code changes needed.
