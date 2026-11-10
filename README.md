# DentalWeb — A space to practice

An interactive platform for renting dental training equipment by the hour:
dental chairs at **150 EGP/hour**, phantom heads at **100 EGP/hour**, and a
**50% deposit** to confirm.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
React Three Fiber and Supabase (Postgres + RLS).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | for live data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for live data | Supabase anon key |
| `NEXT_PUBLIC_BASE_URL` | yes | Public base URL (payment redirects) |
| `PAYMOB_PRIVATE_KEY` / `PAYMOB_PUBLIC_KEY` / `PAYMOB_HMAC_SECRET` | for payments | Paymob credentials |
| `PAYMOB_INTEGRATION_ID` | for payments | Paymob integration id |

Without the Supabase keys the site still runs: listings, courses and station
availability show an explicit "not connected yet" state rather than inventing
data. Apply `supabase/schema.sql` to a Supabase project to enable them.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Seven-scene homepage |
| `/services` | Service index |
| `/services/dental-chair` | Dental chair product page |
| `/services/phantom-head` | Phantom head product page |
| `/facilities` | Facility discovery — search and filters |
| `/facilities/[slug]` | Facility profile |
| `/facilities/[slug]/room` | Interactive room plan and station selection |
| `/facilities/[slug]/book` | The booking flow |
| `/tooth-planner` | Interactive tooth selection (optional, FDI) |
| `/manage` · `/manage/[slug]` | Facility owner workspace |
| `/courses` | Courses published by facilities |
| `/checkout/success` | Post-payment return, verified server-side |

Legacy URLs redirect permanently — see `next.config.ts`.

---

## Project layout

```
src/
  app/                 routes and API handlers
  components/
    3d/                canvas, cameras, lighting, model loading, fallbacks
    booking/           the reservation flow
    facilities/        discovery and profile
    home/              homepage scenes
    manage/            owner workspace
    room/              blueprint and station selection
    service/           product pages
    site/              header, footer, theme context
    teeth/             FDI tooth selection
    ui/                buttons, sections, reveals, breadcrumb
  lib/
    3d/                asset registry, device tiers, scroll drivers
    platform-api.ts    typed client for the platform API
    pricing.ts         confirmed rates and the deposit rule
scripts/               extraction, inspection and verification tools
```

---

## Documentation

| Document | Contents |
|---|---|
| [`ASSET_GUIDE.md`](./ASSET_GUIDE.md) | How to export and register your Blender models |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Decisions, layering, fixes and open questions |
| [`docs/ASSET_MANIFEST.md`](./docs/ASSET_MANIFEST.md) | Every asset, its status and its owner |
| [`docs/CREATIVE_DIRECTION_AND_DESIGN_SYSTEM.md`](./docs/CREATIVE_DIRECTION_AND_DESIGN_SYSTEM.md) | The approved design direction |
| [`docs/HIGH_FIDELITY_VISUAL_DESIGN_SPEC.md`](./docs/HIGH_FIDELITY_VISUAL_DESIGN_SPEC.md) | The approved visual specification |
| [`docs/BOOKING_BUSINESS_RULES.md`](./docs/BOOKING_BUSINESS_RULES.md) | The confirmed booking rules |
| [`docs/SOFTWARE_SPECIFICATION.md`](./docs/SOFTWARE_SPECIFICATION.md) | Product and architecture specification |
| [`docs/UI_UX_WIREFRAMES.md`](./docs/UI_UX_WIREFRAMES.md) | Page-by-page wireframes |

---

## Scripts

```bash
node scripts/extract-blueprint.mjs      # re-extract the room blueprint
node scripts/inspect-glb.mjs <file.glb> # report a GLB's structure and silhouette
node scripts/check-composition.mjs       # verify each asset's camera framing
node scripts/cdp.mjs eval|shot <url> <w> <h> …   # headless Chrome driver
node scripts/cdp-full.mjs <url> <w> <h> <out>    # full-page screenshot
node scripts/audit.mjs                   # accessibility and layout audit
node scripts/resilience.mjs              # reduced-motion and no-WebGL checks
node scripts/interactions.mjs            # tooth and station interaction checks
```

---

## Business rules

These are enforced server-side and must not change without the product
owner's approval:

- Dental chair — **150 EGP per hour**
- Phantom head — **100 EGP per hour**
- Deposit — **50% of the total booking amount**
- A reservation is confirmed **only after the deposit is verified**
- Availability, station occupancy and pricing come from the backend, never
  from the browser

`src/lib/pricing.ts` holds the rates; `POST /api/booking` recomputes them
from the service's configured rate before any hold or charge is created.
