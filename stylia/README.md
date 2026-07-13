# StylIA ✂

**Automated fashion design & parametric pattern drafting SaaS.**
From a photo and five measurements to a millimetre-perfect, print-ready sewing pattern.

Trilingual (🇫🇷 FR / 🇬🇧 EN / 🇪🇸 ES) · dual units (cm / inches) · fully responsive.

## Stack

| Layer | Choice |
|---|---|
| Front-end | Next.js 14 (App Router) + Tailwind CSS |
| Back-end | Next.js route handlers (Node runtime) |
| Database | SQLite via `better-sqlite3` — plain SQL schema, portable to Postgres |
| Auth | Email + password (bcrypt), opaque session tokens in HttpOnly cookies |
| Payments | Stripe (mock-first; swap in the native SDK via env vars) |
| Drafting engine | Pure TypeScript — "Teresa Gilewska" parametric formulas |
| Export | Dependency-free vector PDF writer (A4 / US Letter / A0, tiled at 100 % scale) |

## Quick start

```bash
npm install
npm run db:init      # creates data/stylia.db, applies schema + seeds 7 textiles
npm run dev          # http://localhost:3000
```

The database also self-initialises lazily on first request, so `npm run dev`
alone works too.

## Architecture

```
db/
  schema.sql               # users, sessions, measurements, projects, textiles, payments
  seed.sql                 # 7-fabric textile knowledge base (FR/EN/ES)
scripts/init-db.mjs        # idempotent bootstrap / --reset
src/lib/
  db.ts                    # SQLite singleton + row types
  auth.ts                  # register / login / sessions / role guard
  units.ts                 # cm ⇄ inch (1 in = 2.54 cm), mm-precision display
  i18n/                    # fr / en / es dictionaries + helpers
  pattern/skirtBlock.ts    # ★ the mathematical engine (see below)
  pattern/svg.ts           # print-accurate SVG rendering (1 SVG unit = 1 mm)
  export/pdf.ts            # tiled vector PDF generator with crop marks
  textiles/consultant.ts   # intelligent textile consultant (JSON payload)
  payments/stripe.ts       # checkout sessions, webhook handling, export gating
src/app/
  page.tsx                 # landing
  login / register         # auth
  dashboard/               # project grid + measurement profiles + CTA
  projects/new/            # 3-step wizard (upload → garment → measurements)
  projects/[id]/guide/     # split-screen interactive guide + SVG canvas
  checkout/[sessionId]/    # mock Stripe checkout
  api/                     # REST endpoints (auth, measurements, projects,
                           # svg, export, textiles, checkout, webhooks/stripe)
```

## The drafting engine (Jupe Droite de Base)

All values in **cm**, ease (aisance) = **2 cm** on the hips:

- Total width = (H + 2) / 2 · front panel = (H + 2) / 4 + 1 · back panel = (H + 2) / 4 − 1
- Hip line at `waist_to_hip_height`; total height = `total_length`
- Total waist reduction = total width − W / 2, distributed
  **40 %** side curves (÷2 per side) / **35 %** back dart / **25 %** front dart
- Dart lengths: front 11 cm (10–12), back 14 cm (13–15)

Output: structured segments (`move` / `line` / `quad`) rendered as
solid **cutting paths**, dash-dotted **construction lines** and gold **darts** —
identically in the interactive canvas, the standalone SVG and the PDF export.

## Export gating

Professional Tailors and active subscribers export full size freely.
Hobbyists must complete the (mock) Stripe checkout — until the
`checkout.session.completed` webhook is verified, exports return
**402 Payment Required** and previews are watermarked.

## Going live with Stripe

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, then replace the body of
`createCheckoutSession()` with `stripe.checkout.sessions.create(...)`.
The webhook route and gating logic are shared between mock and live modes.

## Roadmap hooks

The engine is deliberately modular for future work: body-posture adjustments
plug into `skirtBlock.ts` inputs, nesting algorithms consume the same
`Segment[]` geometry, and new garment types register alongside
`straight_skirt_base` in the wizard and the textile consultant.
